/* =========================================================
   강동욱 ♡ 여다은 — 모바일 청첩장
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Gallery build (16 = 001~004 × 4) ---------- */
  var SOURCES = ["img/001.jpg", "img/002.jpg", "img/003.jpg", "img/004.jpg"];
  var TOTAL = 16;
  var VISIBLE = 9; // 기본 노출 장수 (3열 × 3행)

  var grid = document.getElementById("galleryGrid");
  var galleryImages = [];

  if (grid) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < TOTAL; i++) {
      var src = SOURCES[i % 4];
      galleryImages.push(src);

      var fig = document.createElement("figure");
      fig.className = "gallery__item" + (i >= VISIBLE ? " is-extra" : "");
      fig.setAttribute("data-index", i);

      var img = document.createElement("img");
      img.src = src;
      img.alt = "웨딩 사진 " + (i + 1);
      img.loading = "lazy";
      img.decoding = "async";

      fig.appendChild(img);
      frag.appendChild(fig);
    }
    grid.appendChild(frag);
  }

  /* ---------- 1-1. Gallery "더보기" toggle ---------- */
  var moreBtn = document.getElementById("galleryMore");
  if (grid && moreBtn) {
    if (TOTAL <= VISIBLE) {
      moreBtn.parentNode.style.display = "none";
    }
    moreBtn.addEventListener("click", function () {
      var collapsed = grid.classList.toggle("is-collapsed");
      moreBtn.setAttribute("aria-expanded", String(!collapsed));
      moreBtn.textContent = collapsed ? "사진 더보기" : "접기";
      if (collapsed) {
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  /* ---------- 2. Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = lightbox ? lightbox.querySelector(".lightbox__img") : null;
  var lbCurrent = document.getElementById("lbCurrent");
  var lbTotal = document.getElementById("lbTotal");
  var current = 0;

  if (lbTotal) lbTotal.textContent = galleryImages.length;

  function showImage(index) {
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;
    current = index;
    lbImg.src = galleryImages[current];
    if (lbCurrent) lbCurrent.textContent = current + 1;
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (grid && lightbox) {
    grid.addEventListener("click", function (e) {
      var item = e.target.closest(".gallery__item");
      if (!item) return;
      openLightbox(parseInt(item.getAttribute("data-index"), 10));
    });

    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", function () {
      showImage(current - 1);
    });
    lightbox.querySelector(".lightbox__nav--next").addEventListener("click", function () {
      showImage(current + 1);
    });

    // backdrop click closes (but not when tapping image/controls)
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox__stage")) {
        closeLightbox();
      }
    });

    // keyboard
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showImage(current - 1);
      else if (e.key === "ArrowRight") showImage(current + 1);
    });

    // swipe
    var startX = 0, startY = 0, tracking = false;
    var stage = lightbox.querySelector(".lightbox__stage");
    stage.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        showImage(dx < 0 ? current + 1 : current - 1);
      }
    }, { passive: true });
  }

  /* ---------- 3. Accordion ---------- */
  var heads = document.querySelectorAll(".accordion__head");
  heads.forEach(function (head) {
    head.addEventListener("click", function () {
      var body = head.nextElementSibling;
      var isOpen = head.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        head.setAttribute("aria-expanded", "false");
        body.style.maxHeight = null;
      } else {
        head.setAttribute("aria-expanded", "true");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ---------- 4. Copy account number ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-show");
    }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(ta);
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var name = btn.getAttribute("data-name") || "";
      copyText(text).then(
        function () { showToast(name + " 계좌번호가 복사되었습니다"); },
        function () { showToast("복사에 실패했습니다"); }
      );
    });
  });

  /* ---------- 5. Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
