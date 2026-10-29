import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

// Only report file names and rule names. Never print a credential value.
const rules = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ["Google API key", /AIza[\w-]{35}/g],
  ["AWS access key", /(?:AKIA|ASIA)[A-Z0-9]{16}/g],
  [
    "GitHub token",
    /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/g,
  ],
  ["OpenAI key", /sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}/g],
  [
    "JWT credential",
    /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/g,
  ],
  [
    "literal credential assignment",
    /(?:api[_-]?key|password|secret|access[_-]?token|service[_-]?role[_-]?key)["']?\s*[:=]\s*["']([^"'\s]{12,})["']/gi,
  ],
];
const findings = new Set();
let checked = 0;
function scan(label, content) {
  if (content.includes(0)) return;
  checked++;
  const text = content.toString("utf8");
  for (const [rule, regex] of rules) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      if (
        rule === "literal credential assignment" &&
        /example|placeholder|demo|not[-_]?real|^\$|^process\.|^import\./i.test(
          match[1],
        )
      )
        continue;
      const line = text.slice(0, match.index).split("\n").length;
      findings.add(`${label}:${line} — ${rule}`);
    }
  }
}
const current = execFileSync("git", [
  "ls-files",
  "-z",
  "--cached",
  "--others",
  "--exclude-standard",
])
  .toString()
  .split("\0")
  .filter(Boolean);
for (const name of current)
  if (fs.existsSync(name) && fs.statSync(name).isFile())
    scan(name, fs.readFileSync(name));
const objects = execFileSync("git", ["rev-list", "--objects", "--all"])
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);
if (objects.length) {
  const labels = new Map(
    objects.map((row) => {
      const space = row.indexOf(" ");
      return space < 0
        ? [row, row]
        : [row.slice(0, space), row.slice(space + 1)];
    }),
  );
  const data = execFileSync("git", ["cat-file", "--batch"], {
    input: [...labels.keys()].join("\n") + "\n",
    maxBuffer: 100 * 1024 * 1024,
  });
  let offset = 0;
  while (offset < data.length) {
    const end = data.indexOf(10, offset);
    if (end < 0) break;
    const [id, type, sizeText] = data
      .subarray(offset, end)
      .toString()
      .split(" ");
    const size = Number(sizeText);
    if (!Number.isFinite(size))
      throw new Error("Could not inspect Git object.");
    const begin = end + 1;
    if (type === "blob")
      scan(
        `history/${id.slice(0, 8)}/${labels.get(id)}`,
        data.subarray(begin, begin + size),
      );
    offset = begin + size + 1;
  }
}
if (process.argv.includes("--dist")) {
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(name);
      else scan(name, fs.readFileSync(name));
    }
  };
  if (!fs.existsSync("dist"))
    throw new Error("Build dist/ before scanning browser output.");
  walk("dist");
}
if (findings.size) {
  process.stderr.write([...findings].join("\n") + "\n");
  process.exitCode = 1;
} else
  process.stdout.write(
    `No credential-pattern matches in ${checked} text files/blobs (working tree, reachable Git history${process.argv.includes("--dist") ? " and dist/" : ""}).\n`,
  );
