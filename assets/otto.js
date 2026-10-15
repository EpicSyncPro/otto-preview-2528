/* Otto direction prototypes: header behaviour + the coded patient-flow phone.
   The phone never advances on its own: only Prev/Next, step buttons or the in-phone buttons move it. */
(function () {
  "use strict";

  // Header: scrolled hairline + mobile menu
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var btn = header.querySelector(".menu-btn");
    if (btn) btn.addEventListener("click", function () {
      var open = header.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  var CLINIC =
    '<div class="p-head"><span class="p-mono" aria-hidden="true">N</span>' +
    '<span class="p-clinic"><strong>Northgate Eyecare</strong><span>Sample clinic</span></span>' +
    '<span class="p-powered">POWERED BY OTTO</span></div>';

  var VIEWS = {
    store:
      CLINIC +
      '<p class="p-eyebrow">Your practice’s store</p>' +
      '<p class="p-title">Welcome back, Maya.</p>' +
      '<p class="p-sub">Everything’s already set up. Just confirm and go.</p>' +
      '<div class="p-card"><div class="p-prod"><span class="p-thumb" aria-hidden="true"><i></i></span>' +
      '<div><strong>Acuvue Oasys 1-Day</strong><small>90-pack · daily disposable</small><b>$99.00 / box</b></div></div>' +
      '<div class="p-row"><span>Annual supply · 4 boxes</span><span class="p-pill">Best value</span></div>' +
      '<div class="p-ok"><span aria-hidden="true">✓</span><span>Exactly what their optometrist recommended</span></div></div>' +
      '<button class="p-btn" type="button" data-phone-next tabindex="-1">Continue to checkout <span aria-hidden="true">→</span></button>' +
      '<p class="p-cap">Click 1 of 2</p>',
    checkout:
      '<div class="p-head"><span class="p-back"><span aria-hidden="true">‹</span> Checkout</span>' +
      '<span class="p-powered">NORTHGATE EYECARE</span></div>' +
      '<div class="p-lines">' +
      '<div class="p-line"><span>4 boxes · Oasys 1-Day</span><b>$396.00</b></div>' +
      '<div class="p-line save"><span>Vision insurance applied</span><b>−$120.00</b></div>' +
      '<div class="p-line save"><span>Manufacturer rebate</span><b>−$100.00</b></div>' +
      '<div class="p-line"><span>Shipping</span><b>Free</b></div></div>' +
      '<div class="p-total"><span>Total today</span><strong>$176.00</strong></div>' +
      '<p class="p-note">The rebate is submitted automatically by Otto. The patient doesn’t fill out a form, and your staff doesn’t chase it.</p>' +
      '<button class="p-btn" type="button" data-phone-next tabindex="-1">Place order</button>' +
      '<p class="p-cap">Click 2 of 2 · sample amounts</p>',
    placed:
      '<span class="p-check" aria-hidden="true">✓</span>' +
      '<p class="p-title">Order placed.</p>' +
      '<p class="p-sub">Shipping direct to the patient · arrives Thursday. Their next refill reminder is already scheduled.</p>' +
      '<div class="p-side"><span class="p-eyebrow">And on your side</span><strong>$396</strong>' +
      '<p>stayed with your practice instead of walking out with a printed Rx.</p></div>' +
      '<button class="p-btn p-btn-ghost" type="button" data-phone-next tabindex="-1">Months later →</button>',
    reminder:
      '<p class="p-date">Tuesday, October 6</p><p class="p-time">9:41</p>' +
      '<button class="p-notif" type="button" data-phone-go="0" tabindex="-1">' +
      '<span class="meta"><i aria-hidden="true"></i><span>Messages</span><span>now</span></span>' +
      '<strong>Northgate Eyecare <small>· sample clinic</small></strong>' +
      '<p>Hi Maya, you may be due for a refill on your Acuvue Oasys lenses — follow the link to place your order →</p></button>' +
      '<p class="p-cap">Tap to open the message</p>'
  };
  var ORDER = ["store", "checkout", "placed", "reminder"];
  var DEFAULT_LABELS = ["Their store", "Checkout", "Order placed", "Next reminder"];

  function mount(root) {
    var start = Number(root.getAttribute("data-start") || 0);
    // Each direction names the steps in its own visible vocabulary (data-labels="a|b|c|d").
    var LABELS = root.getAttribute("data-labels") ? root.getAttribute("data-labels").split("|") : DEFAULT_LABELS;
    var html = '<div class="phone-frame"><div class="phone-screen">' +
      '<div class="p-status"><span>9:41</span><span class="p-sig" aria-hidden="true"><i></i><i></i><i></i><b></b></span></div>' +
      '<span class="p-island" aria-hidden="true"></span>';
    ORDER.forEach(function (id, i) {
      var cls = "p-view" + (id === "placed" ? " p-done" : "") + (id === "reminder" ? " p-lock" : "");
      html += '<div class="' + cls + '" data-view="' + id + '" aria-label="Step ' + (i + 1) + ' of 4: ' + LABELS[i] + '">' + VIEWS[id] + "</div>";
    });
    html += '</div></div><p class="sr-only" aria-live="polite" data-phone-live></p>';
    root.innerHTML = html;
    root.setAttribute("role", "group");
    root.setAttribute("aria-roledescription", "product demo");
    root.setAttribute("aria-label", "Sample patient reorder, shown on a phone");

    var views = root.querySelectorAll(".p-view");
    var live = root.querySelector("[data-phone-live]");
    var idx = -1;

    function go(n, announce) {
      n = (n + ORDER.length) % ORDER.length;
      if (n === idx) return;
      idx = n;
      views.forEach(function (v, i) {
        var on = i === n;
        v.classList.toggle("is-active", on);
        v.classList.toggle("is-before", i < n);
        v.setAttribute("aria-hidden", String(!on));
        if ("inert" in v) v.inert = !on;
        v.querySelectorAll("button").forEach(function (b) { b.tabIndex = on ? 0 : -1; });
      });
      document.documentElement.setAttribute("data-step", ORDER[n]);
      document.querySelectorAll("[data-phone-go]").forEach(function (b) {
        if (root.contains(b)) return;
        var on = Number(b.getAttribute("data-phone-go")) === n;
        b.classList.toggle("is-active", on);
        b.setAttribute(b.hasAttribute("aria-expanded") ? "aria-expanded" : "aria-pressed", String(on));
      });
      document.querySelectorAll("[data-phone-count]").forEach(function (el) { el.textContent = (n + 1) + " / " + ORDER.length; });
      if (announce && live) live.textContent = "Step " + (n + 1) + " of 4: " + LABELS[n];
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-phone-next],[data-phone-prev],[data-phone-go]");
      if (!t) return;
      if (t.hasAttribute("data-phone-next")) go(idx + 1, true);
      else if (t.hasAttribute("data-phone-prev")) go(idx - 1, true);
      else go(Number(t.getAttribute("data-phone-go")), true);
    });
    go(start, false);
  }

  document.querySelectorAll("[data-phone]").forEach(mount);
})();
