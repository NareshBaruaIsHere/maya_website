/**
 * Maya Landing Page — Vanilla JavaScript
 * Handles: Lucide icons, scroll reveal, smooth scroll, screenshot lightbox
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const APP_VERSION = "1.0.2";
  const APP_VERSION_BENGALI = "1.0.2";
  const MAYA_APK_URL = "assets/downloads/maya.apk";

  function initVersionDisplay() {
    document.title = "মায়া — ব্যক্তিগত নিরাপত্তা ও SOS অ্যাপ";

    const title = document.querySelector("[data-app-version-title]");
    if (title) {
      title.textContent = "মায়া";
    }

    const versionNumber = document.querySelector("[data-app-version-number]");
    if (versionNumber) {
      versionNumber.textContent = APP_VERSION_BENGALI;
    }

    const versionLabel = document.querySelector("[data-app-version-label]");
    if (versionLabel) {
      versionLabel.textContent = `বর্তমান সংস্করণ: v${APP_VERSION}`;
    }

    const footerName = document.querySelector("[data-app-version-footer]");
    if (footerName) {
      footerName.textContent = "মায়া";
    }
  }

  /* --------------------------------------------------------------------------
     APK Download — mobile-friendly direct link + availability check
     -------------------------------------------------------------------------- */
  function showApkToast(message) {
    const toast = document.getElementById("apk-toast");
    if (!toast) return;

    const text = toast.querySelector(".apk-toast__text");
    if (text) text.textContent = message;
    toast.removeAttribute("hidden");

    const closeBtn = toast.querySelector(".apk-toast__close");
    if (closeBtn) {
      closeBtn.onclick = function () {
        toast.setAttribute("hidden", "");
      };
    }
  }

  function initApkDownloads() {
    const links = document.querySelectorAll("[data-apk-download]");

    links.forEach(function (link) {
      link.setAttribute("href", MAYA_APK_URL);
    });

    if (window.location.protocol === "file:") {
      showApkToast(
        "ফাইল হিসেবে খোলা হলে APK ডাউনলোড কাজ নাও করতে পারে। সাইটটি একটি ওয়েব সার্ভারে হোস্ট করুন অথবা GitHub Pages ব্যবহার করুন।",
      );
      return;
    }

    fetch(MAYA_APK_URL, { method: "HEAD" })
      .then(function (response) {
        if (!response.ok) {
          showApkToast(
            "APK ফাইল পাওয়া যায়নি। দয়া করে maya.apk ফাইলটি assets/downloads/ ফোল্ডারে রাখুন।",
          );
        }
      })
      .catch(function () {
        showApkToast(
          "APK ডাউনলোড যাচাই করা যায়নি। নিশ্চিত করুন maya.apk ফাইলটি assets/downloads/ এ আছে।",
        );
      });

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (window.location.protocol === "file:") {
          e.preventDefault();
          showApkToast(
            "সরাসরি ফাইল খোলায় ডাউনলোড কাজ করে না। ওয়েব সার্ভার বা হোস্টিং ব্যবহার করুন।",
          );
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Initialize Lucide Icons
     -------------------------------------------------------------------------- */
  function initIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  /* --------------------------------------------------------------------------
     Scroll Reveal — IntersectionObserver
     -------------------------------------------------------------------------- */
  function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    if (prefersReducedMotion) {
      reveals.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
     Smooth Scroll for In-Page Anchor Links
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        /* Move focus for accessibility without scrolling again */
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: true });
      });
    });
  }

  /* --------------------------------------------------------------------------
     Screenshot Lightbox
     -------------------------------------------------------------------------- */
  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector(".lightbox__image");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const backdrop = lightbox.querySelector(".lightbox__backdrop");
    const screenshotCards = document.querySelectorAll(
      ".screenshot-card[data-lightbox]",
    );

    let lastFocusedElement = null;

    function openLightbox(src, alt) {
      lastFocusedElement = document.activeElement;
      lightboxImage.src = src;
      lightboxImage.alt = alt || "স্ক্রিনশট প্রিভিউ";
      lightbox.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.setAttribute("hidden", "");
      lightboxImage.src = "";
      document.body.style.overflow = "";
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    screenshotCards.forEach(function (card) {
      card.addEventListener("click", function () {
        const src = this.getAttribute("data-lightbox");
        const img = this.querySelector("img");
        const alt = img ? img.getAttribute("alt") : "";
        openLightbox(src, alt);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    backdrop.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hasAttribute("hidden")) {
        closeLightbox();
      }
    });

    /* Basic focus trap inside lightbox */
    lightbox.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || lightbox.hasAttribute("hidden")) return;

      const focusable = lightbox.querySelectorAll("button, [href], [tabindex]");
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* --------------------------------------------------------------------------
     DOM Ready
     -------------------------------------------------------------------------- */
  function init() {
    initVersionDisplay();
    initIcons();
    initReveal();
    initSmoothScroll();
    initLightbox();
    initApkDownloads();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
