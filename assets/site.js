/* Otto site shells: Features dropdown, CAD/USD toggle, step accordion (C) and the demo form.
   otto.js handles the sticky header, the mobile menu and the coded phone. */
(function () {
  "use strict";

  // Features dropdown: button + panel. Esc closes and returns focus; click outside or tabbing away closes.
  document.querySelectorAll(".dd").forEach(function (dd) {
    var btn = dd.querySelector(".dd-btn");
    var panel = dd.querySelector(".dd-panel");
    var set = function (open) { btn.setAttribute("aria-expanded", String(open)); dd.classList.toggle("is-open", open); };
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    dd.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); }
      if (e.key === "ArrowDown" && document.activeElement === btn) {
        e.preventDefault(); set(true); var first = panel.querySelector("a"); if (first) first.focus();
      }
    });
    dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
    document.addEventListener("click", function (e) { if (!dd.contains(e.target)) set(false); });
  });

  // Pricing currency toggle: only the labels change; amounts stay "To be confirmed".
  var cur = document.querySelector(".o-cur");
  if (cur) cur.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-cur]"); if (!b) return;
    var c = b.getAttribute("data-cur");
    cur.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    document.querySelectorAll("[data-cur-symbol]").forEach(function (el) { el.textContent = c === "USD" ? "US$" : "CA$"; });
    document.querySelectorAll("[data-cur-name]").forEach(function (el) { el.textContent = c; });
    var note = document.querySelector("[data-cur-note]");
    if (note) note.textContent = c === "USD" ? "Showing US dollars. USD pricing is being confirmed with Otto." : "Showing Canadian dollars. Prices are being confirmed with Otto.";
  });

  // Direction C step accordion. Markup ships every step open; enhancement collapses all but the first
  // (with reduced motion every step stays open).
  var steps = document.querySelectorAll("button[data-step][aria-controls^=\"c-step-\"]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  steps.forEach(function (b, i) {
    var body = document.getElementById(b.getAttribute("aria-controls"));
    if (!body) return; // proto homepage steps are driven by otto.js
    var set = function (open) { b.setAttribute("aria-expanded", String(open)); body.hidden = !open; };
    set(reduce || i === 0);
    b.addEventListener("click", function () { set(b.getAttribute("aria-expanded") !== "true"); });
  });

  // Demo form: posts nowhere in the shell.
  var form = document.querySelector("[data-demo-form]");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = form.querySelector("[data-form-status]");
    var missing = Array.prototype.filter.call(form.querySelectorAll("[required]"), function (el) { return !el.value.trim(); });
    form.querySelectorAll("[required]").forEach(function (el) { el.setAttribute("aria-invalid", String(missing.indexOf(el) > -1)); });
    if (missing.length) { status.textContent = "Please fill in the required fields."; missing[0].focus(); return; }
    status.textContent = "Thanks. This is a design shell, so nothing was sent. On the live site this goes to Otto’s team.";
  });
})();
