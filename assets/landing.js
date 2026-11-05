// Smart Clock landing page
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function (fbEvent, gaEvent, params) {
    try { if (window.fbq && fbEvent) fbq("track", fbEvent, params || {}); } catch (e) {}
    try { if (window.gtag && gaEvent) gtag("event", gaEvent, params || {}); } catch (e) {}
  };

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Header shadow + mobile menu
  var top = $("#top"), menuBtn = $(".menu-btn");
  window.addEventListener("scroll", function () { top.classList.toggle("scrolled", window.scrollY > 8); }, { passive: true });
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = top.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { top.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }); });
  }

  // Scroll reveal
  var rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  // Mobile sticky bar: show after the hero form scrolls out of view, hide near the final form
  var mbar = $("#mbar"), heroForm = $("#start"), finalSec = $(".final");
  if (mbar && heroForm && "IntersectionObserver" in window) {
    var heroVisible = true, finalVisible = false;
    var upd = function () { mbar.classList.toggle("show", !heroVisible && !finalVisible); };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; upd(); }).observe(heroForm);
    if (finalSec) new IntersectionObserver(function (es) { finalVisible = es[0].isIntersecting; upd(); }).observe(finalSec);
  }

  // CTA buttons focus the hero form
  $$("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () {
      track(null, "cta_click", { place: a.getAttribute("data-cta") });
      setTimeout(function () { var i = $("#h-name"); if (i) i.focus({ preventScroll: true }); }, 600);
    });
  });

  // WhatsApp click tracking
  $$("[data-wa]").forEach(function (a) {
    a.addEventListener("click", function () { track("Contact", "whatsapp_click", { place: a.getAttribute("data-wa") }); });
  });

  // Savings calculator
  var range = $("#staffRange");
  if (range) {
    var fmt = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
    var calc = function () {
      var n = +range.value, sc = 250, hs = n * 10 * 12, td = n * 11.67 * 12, max = Math.max(sc, hs, td);
      $("#staff").textContent = n;
      $("#scCost").textContent = fmt(sc); $("#hsCost").textContent = fmt(hs); $("#tdCost").textContent = fmt(td);
      $("#scBar").style.width = (sc / max * 100) + "%";
      $("#hsBar").style.width = (hs / max * 100) + "%";
      $("#tdBar").style.width = (td / max * 100) + "%";
      var s = td - sc;
      $("#saveVal").textContent = s > 0 ? fmt(s) : "$0";
    };
    range.addEventListener("input", calc);
    range.addEventListener("change", function () { track(null, "calculator_used", { staff: +range.value }); });
    calc();
  }

  // Trial forms → Formsubmit (AJAX)
  var params = new URLSearchParams(location.search);
  var source = ["utm_source", "utm_medium", "utm_campaign", "utm_content"].map(function (k) { return params.get(k) ? k.replace("utm_", "") + "=" + params.get(k) : ""; }).filter(Boolean).join(", ") || "direct";

  $$(".trial-form").forEach(function (form) {
    var msg = $(".form-msg", form), btn = $("button[type=submit]", form), started = false;
    form.addEventListener("input", function () { if (!started) { started = true; track(null, "form_start", { place: form.dataset.place }); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg"; msg.textContent = "";
      var bad = $$("input[required], select[required]", form).filter(function (el) { return !el.checkValidity(); });
      if (bad.length) { msg.className = "form-msg err"; msg.textContent = "Please add your name, team size and a valid email."; bad[0].focus(); return; }
      var data = Object.fromEntries(new FormData(form));
      data._subject = "Smart Clock free trial: " + (data.name || "") + " (" + (data.team_size || "") + ")";
      data._template = "table";
      data._captcha = "false";
      data.product = "Smart Clock free trial";
      data.source = source;
      data.page = location.href.split("#")[0];
      btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…";
      fetch("https://formsubmit.co/ajax/info@psfinsolutions.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && (res.success === true || res.success === "true")) {
          form.classList.add("sent");
          track("Lead", "generate_lead", { content_name: "Smart Clock trial", team_size: data.team_size, place: form.dataset.place });
        } else { throw new Error("fail"); }
      }).catch(function () {
        msg.className = "form-msg err";
        msg.innerHTML = 'That didn’t go through. Please try again, or message us on <a href="https://wa.me/919809970890?text=Hi%2C%20I%27d%20like%20a%20Smart%20Clock%20free%20trial." target="_blank" rel="noopener">WhatsApp</a>.';
      }).then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();
