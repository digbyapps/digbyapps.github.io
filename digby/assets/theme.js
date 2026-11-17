// Footer theme switch: follows the Mac's setting until clicked, then remembers the choice (shared by every Digby page).
// Screenshots chosen by <source media="(prefers-color-scheme: dark)"> follow the switch too.
(() => {
  const root = document.documentElement, btn = document.querySelector("footer .theme"), mq = matchMedia("(prefers-color-scheme: dark)");
  if (!btn) return;
  const sources = [...document.querySelectorAll('source[media*="prefers-color-scheme: dark"]')];
  sources.forEach(s => s.dataset.media = s.media);
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
  const apply = () => {
    const t = root.dataset.theme;
    sources.forEach(s => s.media = t ? (t === "dark" ? "all" : "not all") : s.dataset.media);
    const l = isDark() ? "Switch to light mode" : "Switch to dark mode";
    btn.setAttribute("aria-label", l); btn.title = l;
  };
  btn.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("digby-theme", root.dataset.theme) } catch (e) {}
    apply();
  });
  mq.addEventListener("change", apply);
  apply();
})();
