// iConstruct Electrical Services — replacement site by TA Soft
(function () {
  "use strict";

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Forms (static demo: validate then show a success message — no backend)
  // #enquiry-form (contact page) and #quote-form (homepage) share identical behavior.
  function wireDemoForm(formId, successId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var success = document.getElementById(successId);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var ok = input.value.trim().length > 0;
        if (ok && input.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        if (field) field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;
      form.style.display = "none";
      if (success) {
        success.classList.add("visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
    form.querySelectorAll("[required]").forEach(function (input) {
      var clear = function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("invalid");
      };
      input.addEventListener("input", clear);
      input.addEventListener("change", clear);
    });
  }
  wireDemoForm("enquiry-form", "form-success");
  wireDemoForm("quote-form", "quote-success");
  // Discreet client-side logo preview switcher (New vs Original)
  var logoSwitcher = document.querySelector("[data-logo-switcher]");
  if (logoSwitcher) {
    var logoToggle = logoSwitcher.querySelector("[data-logo-toggle]");
    var logoButtons = Array.prototype.slice.call(logoSwitcher.querySelectorAll("[data-logo-variant]"));
    var logoSlots = document.querySelectorAll("[data-logo-slot]");
    var newLogo = logoSlots.length ? logoSlots[0].innerHTML : "";
    var originalSrc = logoSwitcher.getAttribute("data-logo-original") || "";
    var originalLogo = '<img src="' + originalSrc + '" alt="iConstruct Electrical Services — original logo" width="283" height="66">';
    var logoVariants = { "new": newLogo, "original": originalLogo };

    var setLogoVariant = function (name) {
      var key = logoVariants[name] ? name : "new";
      logoSlots.forEach(function (slot) { slot.innerHTML = logoVariants[key]; });
      logoButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.getAttribute("data-logo-variant") === key));
      });
      try { localStorage.setItem("iconstruct-logo-variant", key); } catch (_) {}
    };

    if (logoToggle) {
      logoToggle.addEventListener("click", function () {
        var open = logoSwitcher.classList.toggle("is-open");
        logoToggle.setAttribute("aria-expanded", String(open));
      });
    }

    logoButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setLogoVariant(button.getAttribute("data-logo-variant"));
        logoSwitcher.classList.remove("is-open");
        if (logoToggle) logoToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (event) {
      if (!logoSwitcher.contains(event.target)) {
        logoSwitcher.classList.remove("is-open");
        if (logoToggle) logoToggle.setAttribute("aria-expanded", "false");
      }
    });

    var savedLogo = "new";
    try { savedLogo = localStorage.getItem("iconstruct-logo-variant") || "new"; } catch (_) {}
    setLogoVariant(savedLogo);
  }
})();
