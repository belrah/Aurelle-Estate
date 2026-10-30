(function () {
  var preference;
  try {
    preference = localStorage.getItem("aurelle-theme");
  } catch {
    /* Browser storage is optional. */
  }
  var theme =
    preference === "light" || preference === "dark"
      ? preference
      : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#0b141e" : "#faf7f2";
})();
