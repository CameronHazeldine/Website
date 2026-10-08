// Waikato Building Solutions — site scripts
(function () {
  "use strict";

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Project filters
  var filterBtns = document.querySelectorAll(".filter-btn");
  var projects = document.querySelectorAll(".project[data-category]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      projects.forEach(function (p) {
        var match = filter === "all" || p.getAttribute("data-category") === filter;
        p.classList.toggle("is-hidden", !match);
      });
    });
  });

  // Photo gallery lightbox
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  if (galleryItems.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<img alt=""><p></p>' +
      '<button class="lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(box);
    var boxImg = box.querySelector("img");
    var boxCaption = box.querySelector("p");
    var current = 0;
    var lastFocus = null;

    var show = function (index) {
      current = (index + galleryItems.length) % galleryItems.length;
      var item = galleryItems[current];
      boxImg.src = item.getAttribute("href");
      boxImg.alt = item.querySelector("img").alt;
      boxCaption.textContent = item.getAttribute("data-caption") || "";
    };
    var close = function () {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        lastFocus = item;
        show(index);
        box.classList.add("is-open");
        document.body.style.overflow = "hidden";
        box.querySelector(".lb-close").focus();
      });
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  // Contact form
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");

  function setError(field, hasError) {
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.toggle("has-error", hasError);
    field.setAttribute("aria-invalid", String(hasError));
  }

  function validate() {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (field) {
      var value = field.value.trim();
      var valid = field.type === "checkbox" ? field.checked : value.length > 0;
      if (valid && field.type === "email") {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (valid && field.type === "tel" && value) {
        valid = /^[0-9+()\s-]{7,}$/.test(value);
      }
      setError(field, !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      if (field.closest(".field.has-error")) setError(field, false);
    });
  });

  function showStatus(type, message) {
    status.className = "form-status is-" + type;
    status.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector(".hp input").value) return; // spam bot

    if (!validate()) {
      showStatus("error", "Please fix the highlighted fields and try again.");
      var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    var endpoint = form.getAttribute("data-endpoint");
    var data = new FormData(form);

    // No form service configured yet: fall back to the visitor's email app.
    if (!endpoint) {
      var to = form.getAttribute("data-mailto");
      var subject = "Website enquiry: " + (data.get("service") || "General") + " — " + data.get("name");
      var body = [
        "Name: " + data.get("name"),
        "Email: " + data.get("email"),
        "Phone: " + (data.get("phone") || "-"),
        "Location: " + (data.get("location") || "-"),
        "Service: " + (data.get("service") || "-"),
        "Budget: " + (data.get("budget") || "-"),
        "",
        data.get("message")
      ].join("\n");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      showStatus("success", "Your email app should now open with your enquiry ready to send.");
      return;
    }

    var submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        showStatus("success", "Thanks! Your enquiry has been sent. We'll be in touch within one business day.");
      })
      .catch(function () {
        showStatus("error", "Sorry, something went wrong. Please call us or email us directly.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Enquiry";
      });
  });
})();
