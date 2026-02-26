// PS Fin Solutions - Enhanced JS (mobile menu + smooth scroll + scroll animations)
(function () {
  // Mobile menu toggle
  const nav = document.querySelector(".nav");
  const btn = document.querySelector("[data-menu]");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  // Smooth scroll for same-page anchor links
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", id);
  });

  // Scroll reveal animations
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );

  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // Header background change on scroll
  const header = document.querySelector(".header");
  if (header) {
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      if (scrollY > 80) {
        header.style.background = "rgba(20,14,48,0.95)";
      } else {
        header.style.background = "rgba(20,14,48,0.80)";
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // Cursor light effect
  const cursorLight = document.getElementById("cursorLight");
  if (cursorLight) {
    let mouseX = 0, mouseY = 0;
    let lightX = 0, lightY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animateLight() {
      lightX += (mouseX - lightX) * 0.15;
      lightY += (mouseY - lightY) * 0.15;
      cursorLight.style.left = lightX + "px";
      cursorLight.style.top = lightY + "px";
      requestAnimationFrame(animateLight);
    }
    animateLight();

    // Hide on mobile / touch
    document.addEventListener("touchstart", () => {
      cursorLight.style.opacity = "0";
    }, { once: true, passive: true });
  }

  // Calendar Booking Widget
  var calWidget = document.getElementById("calendarWidget");
  if (calWidget) {
    var calDays = document.getElementById("calDays");
    var calLabel = document.getElementById("calMonthLabel");
    var calPrev = document.getElementById("calPrev");
    var calNext = document.getElementById("calNext");
    var GCAL_URL = "https://calendar.app.google/rGmQ97WpT51jSFLS7";
    var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var now = new Date();
    var viewYear = now.getFullYear();
    var viewMonth = now.getMonth();

    function renderCalendar() {
      var today = new Date();
      today.setHours(0,0,0,0);
      calLabel.textContent = MONTHS[viewMonth] + " " + viewYear;
      calDays.innerHTML = "";
      var firstDay = new Date(viewYear, viewMonth, 1).getDay();
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      var daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

      for (var i = firstDay - 1; i >= 0; i--) {
        var btn = document.createElement("button");
        btn.className = "calendar-day other-month";
        btn.textContent = daysInPrev - i;
        btn.disabled = true;
        calDays.appendChild(btn);
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var btn = document.createElement("button");
        btn.className = "calendar-day";
        btn.textContent = d;
        var thisDate = new Date(viewYear, viewMonth, d);
        thisDate.setHours(0,0,0,0);
        if (thisDate.getTime() === today.getTime()) btn.classList.add("today");
        if (thisDate < today) {
          btn.classList.add("past");
        } else {
          btn.addEventListener("click", function() {
            window.open(GCAL_URL, "_blank", "noopener,noreferrer");
          });
        }
        calDays.appendChild(btn);
      }

      var totalCells = firstDay + daysInMonth;
      var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (var i = 1; i <= remaining; i++) {
        var btn = document.createElement("button");
        btn.className = "calendar-day other-month";
        btn.textContent = i;
        btn.disabled = true;
        calDays.appendChild(btn);
      }
    }

    calPrev.addEventListener("click", function() {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    calNext.addEventListener("click", function() {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });

    renderCalendar();
  }

  // ========== CALENDAR MODAL POPUP ==========
  function initCalendarModal() {
    var GCAL = "https://calendar.app.google/rGmQ97WpT51jSFLS7";
    var MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var now = new Date();
    var mYear = now.getFullYear();
    var mMonth = now.getMonth();

    // Create modal DOM
    var overlay = document.createElement("div");
    overlay.className = "calendar-modal-overlay";
    overlay.id = "calendarModalOverlay";
    overlay.innerHTML =
      '<div class="calendar-modal">' +
        '<button class="calendar-modal-close" aria-label="Close calendar">&times;</button>' +
        '<h3 class="calendar-modal-title">Schedule a Consultation</h3>' +
        '<div class="calendar-widget" id="modalCalWidget">' +
          '<div class="calendar-header">' +
            '<button class="calendar-nav-btn" id="mCalPrev" aria-label="Previous month"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg></button>' +
            '<h3 class="calendar-month-label" id="mCalLabel"></h3>' +
            '<button class="calendar-nav-btn" id="mCalNext" aria-label="Next month"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg></button>' +
          '</div>' +
          '<div class="calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>' +
          '<div class="calendar-days" id="mCalDays"></div>' +
          '<div class="calendar-footer"><p class="calendar-footer-note">Select a date to book your consultation</p></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var mCalDays = document.getElementById("mCalDays");
    var mCalLabel = document.getElementById("mCalLabel");

    function renderModal() {
      var today = new Date(); today.setHours(0,0,0,0);
      mCalLabel.textContent = MONTH_NAMES[mMonth] + " " + mYear;
      mCalDays.innerHTML = "";
      var firstDay = new Date(mYear, mMonth, 1).getDay();
      var daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
      var daysInPrev = new Date(mYear, mMonth, 0).getDate();
      for (var i = firstDay - 1; i >= 0; i--) {
        var b = document.createElement("button"); b.className = "calendar-day other-month"; b.textContent = daysInPrev - i; b.disabled = true; mCalDays.appendChild(b);
      }
      for (var d = 1; d <= daysInMonth; d++) {
        var b = document.createElement("button"); b.className = "calendar-day"; b.textContent = d;
        var dt = new Date(mYear, mMonth, d); dt.setHours(0,0,0,0);
        if (dt.getTime() === today.getTime()) b.classList.add("today");
        if (dt < today) { b.classList.add("past"); } else { b.addEventListener("click", function() { window.open(GCAL, "_blank", "noopener,noreferrer"); closeModal(); }); }
        mCalDays.appendChild(b);
      }
      var total = firstDay + daysInMonth; var rem = total % 7 === 0 ? 0 : 7 - (total % 7);
      for (var i = 1; i <= rem; i++) { var b = document.createElement("button"); b.className = "calendar-day other-month"; b.textContent = i; b.disabled = true; mCalDays.appendChild(b); }
    }

    document.getElementById("mCalPrev").addEventListener("click", function() { mMonth--; if (mMonth < 0) { mMonth = 11; mYear--; } renderModal(); });
    document.getElementById("mCalNext").addEventListener("click", function() { mMonth++; if (mMonth > 11) { mMonth = 0; mYear++; } renderModal(); });

    function openModal() { mMonth = (new Date()).getMonth(); mYear = (new Date()).getFullYear(); renderModal(); overlay.classList.add("active"); document.body.style.overflow = "hidden"; }
    function closeModal() { overlay.classList.remove("active"); document.body.style.overflow = ""; }

    overlay.querySelector(".calendar-modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function(e) { if (e.key === "Escape" && overlay.classList.contains("active")) closeModal(); });

    // Attach to all .schedule-meeting-btn elements
    var triggers = document.querySelectorAll(".schedule-meeting-btn");
    triggers.forEach(function(btn) { btn.addEventListener("click", function(e) { e.preventDefault(); openModal(); }); });
  }
  initCalendarModal();

  // ========== RESULTS SHOWCASE (Auto-updating from Instagram via Behold.so) ==========
  // This fetches the latest posts from @fixsy_fixiteasy via Behold JSON feed.
  // To change the feed, update the URL below with your Behold feed ID.
  var BEHOLD_FEED_URL = "https://feeds.behold.so/LoiErYXtn0eVqz70LJsZ";

  var resultsTrack = document.querySelector(".results-track");
  if (resultsTrack) {
    fetch(BEHOLD_FEED_URL)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var posts = data.posts || [];
        if (!posts.length) return;
        posts.forEach(function(post) {
          var card = document.createElement("a");
          card.className = "result-card";
          card.href = post.permalink || "#";
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          // Use medium size image (optimized from Behold CDN)
          var imgUrl = (post.sizes && post.sizes.medium) ? post.sizes.medium.mediaUrl : (post.thumbnailUrl || post.mediaUrl);
          var caption = (post.prunedCaption || "").split("\n")[0]; // First line only
          var safeCaption = caption.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          card.innerHTML =
            '<img src="' + imgUrl + '" alt="Credit repair result" loading="lazy" />' +
            '<div class="result-card__footer">' +
              '<span class="result-card__caption">' + safeCaption + '</span>' +
              '<span class="result-card__ig">View on IG</span>' +
            '</div>';
          resultsTrack.appendChild(card);
        });
        // Re-init arrow scroll after cards loaded
        initResultsArrows();
      })
      .catch(function(err) {
        console.log("Results feed unavailable:", err);
      });
  }

  // Results carousel arrow scroll
  function initResultsArrows() {
    var resultsArrows = document.querySelectorAll(".results-arrow");
    if (resultsTrack && resultsArrows.length) {
      resultsArrows.forEach(function(arrow) {
        arrow.addEventListener("click", function() {
          var dir = parseInt(this.getAttribute("data-dir"), 10);
          var cardW = resultsTrack.querySelector(".result-card");
          var scrollAmount = cardW ? cardW.offsetWidth + 20 : 340;
          resultsTrack.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
        });
      });
    }
  }
  initResultsArrows();
})();
