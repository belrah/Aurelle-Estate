import { z } from "zod";
import { properties, type Property } from "./data";
export const currency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
export type Filters = {
  category?: string;
  location?: string;
  min?: number;
  max?: number;
  beds?: number;
  baths?: number;
  type?: string;
  status?: string;
};
export function filterProperties(data: Property[], f: Filters) {
  return data.filter(
    (p) =>
      (!f.category ||
        f.category === "All properties" ||
        p.category === f.category) &&
      (!f.location ||
        p.location.toLowerCase().includes(f.location.trim().toLowerCase())) &&
      (f.min === undefined || p.price >= f.min) &&
      (f.max === undefined || p.price <= f.max) &&
      (!f.beds || p.beds >= f.beds) &&
      (!f.baths || p.baths >= f.baths) &&
      (!f.type || p.type === f.type) &&
      (!f.status || p.status === f.status),
  );
}
export const resolveProperty = (slug: string) =>
  properties.find((p) => p.slug === slug);
export function mortgage(
  price: number,
  deposit: number,
  rate: number,
  years: number,
  fees = 0,
) {
  if (
    ![price, deposit, rate, years, fees].every(Number.isFinite) ||
    price <= 0 ||
    deposit < 0 ||
    deposit > price ||
    rate < 0 ||
    rate > 100 ||
    years <= 0 ||
    years > 50 ||
    fees < 0
  )
    throw new Error(
      "Use a positive price, a deposit between zero and the price, a rate from 0–100%, and a term up to 50 years.",
    );
  const principal = price - deposit,
    n = Math.round(years * 12),
    r = rate / 1200;
  if (n < 1) throw new Error("The loan term must be at least one month.");
  const monthly = r
    ? (principal * r) / (1 - Math.pow(1 + r, -n))
    : principal / n;
  let balance = principal;
  const schedule = [];
  let interestTotal = 0;
  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    interestTotal += interest;
    balance = Math.max(0, balance - (monthly - interest));
    if (month % 12 === 0 || month === n)
      schedule.push({
        year: Math.ceil(month / 12),
        balance: Math.round(balance),
        paid: Math.round(principal - balance),
        interest: Math.round(interestTotal),
      });
  }
  return {
    principal,
    monthly,
    interest: monthly * n - principal,
    total: monthly * n + fees,
    fees,
    schedule,
  };
}
export const enquirySchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.email("Enter a valid email."),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number.")
    .refine(
      (value) => (value.match(/\d/g) || []).length >= 7,
      "Enter a valid phone number.",
    ),
  type: z.string().min(1),
  message: z.string().min(15, "Please include at least 15 characters."),
  method: z.string(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});
export const consentSchema = z.literal(true, {
  error: "Please confirm you have read the draft agreement.",
});
export const agreementVersion = "draft-2026-02";
export const agreementOpening =
  "Kindly read through our agency agreement terms and conditions below. By submitting this form, you agree to the terms and conditions stated below.";
export const agreementPreamble =
  "This AGENCY AGREEMENT is made between (Applying Agent) and Aurelle Limited, a body registered under Part A of the Companies and Allied Matters Act, Cap C20, Laws of the Federation of Nigeria, and having its registered Office address at Aurelle Building, Lekki-Epe Expressway, Salem bus stop, Lekki – Lagos (Principal), on the other part, HEREBY APPOINTS (Agent) in accordance with the terms of this Agreement:";
export const agreementTopics = [
  [
    "Agency Relationship",
    "The proposed relationship is between the applying Agent and Aurelle Limited as Principal. An application is an expression of interest and does not itself confirm appointment. The scope of representation, territory, duration and authority to act must be stated in the final written agreement. An Agent must not make commitments, receive funds or sign documents on behalf of the Principal without express written authority.",
  ],
  [
    "Agency Duties",
    "The proposed duties include introducing prospective clients, sharing authorised property information, coordinating inspections and keeping accurate records of agreed activity. Agents are expected to communicate honestly, disclose conflicts of interest and protect confidential client and business information. Property details and availability must be confirmed before they are presented to a client; pricing, returns or approvals must not be guaranteed.",
  ],
  [
    "Commission",
    "Commission eligibility, the applicable rate, how a lead is attributed, any permitted deductions and the payment trigger must be agreed in writing for the relevant instruction. No final commission percentage is established by this preview. Any commission request should identify the transaction and include the supporting records required by the Principal. Disputed amounts should be reviewed before any payment commitment is made.",
  ],
  [
    "Indemnification",
    "The final agreement should define responsibility for losses arising from unauthorised acts, misrepresentation, breach of confidentiality or other proven breaches of the agreed duties. Any indemnity must be reviewed for its scope, evidence requirements, exclusions and fair allocation of responsibility. This draft does not establish an unlimited indemnity or settle either party’s legal liability.",
  ],
  [
    "Termination",
    "The final agreement should set out how either party may end the relationship, any notice required and the process for addressing a material breach. On termination, outstanding leads, client records, authorised materials and any properly earned commission should be reconciled under the signed terms. Confidential information must continue to be protected. Dispute handling and any continuing obligations must be set out in the final reviewed agreement.",
  ],
];
