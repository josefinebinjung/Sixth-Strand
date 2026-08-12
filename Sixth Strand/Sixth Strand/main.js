(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".nav-drawer");
  var lastY = window.scrollY || 0;
  var ticking = false;

  function onScroll() {
    if (!header) return;

    var y = window.scrollY || 0;
    var delta = y - lastY;

    if (y < 8) {
      header.classList.remove("is-hidden");
    } else if (delta > 6 && y > header.offsetHeight) {
      header.classList.add("is-hidden");
      if (drawer) drawer.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    } else if (delta < -6) {
      header.classList.remove("is-hidden");
    }

    lastY = y;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    var nodes = document.querySelectorAll(".reveal");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach(function (node) {
      io.observe(node);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (node) {
      node.classList.add("is-visible");
    });
  }

  document.querySelectorAll(".accordion__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".accordion__item");
      if (!item) return;
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  var applyForm = document.getElementById("apply-form");
  if (applyForm) {
    var applyView = document.getElementById("apply-view");
    var successView = document.getElementById("success-view");

    function setError(field, message) {
      var wrap = applyForm.querySelector('[data-field="' + field + '"]');
      var error = document.getElementById("error-" + field);
      if (!wrap || !error) return;
      wrap.classList.add("is-invalid");
      error.hidden = false;
      error.textContent = message;
    }

    function clearError(field) {
      var wrap = applyForm.querySelector('[data-field="' + field + '"]');
      var error = document.getElementById("error-" + field);
      if (!wrap || !error) return;
      wrap.classList.remove("is-invalid");
      error.hidden = true;
      error.textContent = "";
    }

    function clearAllErrors() {
      ["name", "email", "linkedin", "role", "domain", "why", "sales", "capital"].forEach(clearError);
    }

    function isEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isUrl(value) {
      try {
        var url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (e) {
        return false;
      }
    }

    function validate() {
      clearAllErrors();
      var valid = true;
      var firstInvalid = null;

      var name = applyForm.full_name.value.trim();
      var email = applyForm.email.value.trim();
      var linkedin = applyForm.linkedin.value.trim();
      var role = applyForm.role_company.value.trim();
      var domain = applyForm.domain.value.trim();
      var why = applyForm.why_ownership.value.trim();
      var sales = applyForm.querySelector('input[name="sales_calls"]:checked');
      var capital = applyForm.capital.value;

      if (!name) {
        setError("name", "Full name — enter your name.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.full_name;
      }

      if (!email) {
        setError("email", "Email — enter your email address.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.email;
      } else if (!isEmail(email)) {
        setError("email", "Email — enter a valid email address.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.email;
      }

      if (!linkedin) {
        setError("linkedin", "LinkedIn URL — enter your LinkedIn URL.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.linkedin;
      } else if (!isUrl(linkedin)) {
        setError("linkedin", "LinkedIn URL — enter a full URL starting with https://.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.linkedin;
      }

      if (!role) {
        setError("role", "Current or most recent role, and company — enter both role and company.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.role_company;
      }

      if (!domain) {
        setError("domain", "Domain — name the domain where you have real standing.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.domain;
      }

      if (!why) {
        setError("why", "Why ownership, and why now — write a short answer.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.why_ownership;
      }

      if (!sales) {
        setError("sales", "Sales calls from week one — select yes or no.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.querySelector('input[name="sales_calls"]');
      }

      if (!capital) {
        setError("capital", "Capital available for the Build — choose a range.");
        valid = false;
        firstInvalid = firstInvalid || applyForm.capital;
      }

      if (firstInvalid && typeof firstInvalid.focus === "function") {
        firstInvalid.focus();
      }

      return valid;
    }

    function showSuccess() {
      if (applyView) applyView.hidden = true;
      if (successView) {
        successView.hidden = false;
        successView.setAttribute("tabindex", "-1");
        successView.focus();
      }
      window.scrollTo(0, 0);
      if (window.dataLayer) {
        window.dataLayer.push({ event: "apply_success" });
      }
    }

    applyForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate()) return;

      var payload = {
        full_name: applyForm.full_name.value.trim(),
        email: applyForm.email.value.trim(),
        linkedin: applyForm.linkedin.value.trim(),
        role_company: applyForm.role_company.value.trim(),
        domain: applyForm.domain.value.trim(),
        why_ownership: applyForm.why_ownership.value.trim(),
        sales_calls: applyForm.querySelector('input[name="sales_calls"]:checked').value,
        capital: applyForm.capital.value,
        submitted_at: new Date().toISOString()
      };

      try {
        var existing = JSON.parse(localStorage.getItem("sixthstrand_applications") || "[]");
        if (!Array.isArray(existing)) existing = [];
        existing.push(payload);
        localStorage.setItem("sixthstrand_applications", JSON.stringify(existing));
      } catch (e) {
        /* storage may be blocked; success UI still proceeds */
      }

      showSuccess();
    });

    applyForm.addEventListener("input", function (event) {
      var field = event.target.closest("[data-field]");
      if (!field) return;
      clearError(field.getAttribute("data-field"));
    });

    applyForm.addEventListener("change", function (event) {
      var field = event.target.closest("[data-field]");
      if (!field) return;
      clearError(field.getAttribute("data-field"));
    });
  }
})();
