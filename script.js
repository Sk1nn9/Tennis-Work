// 1. Установите дату (Год-Месяц-ДеньTЧасы:Минуты:Секунды)
const targetDate = new Date("2026-09-26T00:00:00").getTime();

const countdown = setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) {
    clearInterval(countdown);
    document.querySelector(".hero__timer-container").innerHTML = "<h3>Кэмп начался!</h3>";
    return;
  }

  // Расчет времени
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Вывод в HTML (добавляем 0 перед однозначными числами для красоты)
  document.getElementById("days").innerText = days < 10 ? "0" + days : days;
  document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
  document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
  document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;

}, 1000);

const slideTrack = document.querySelector(".slide__track");
const slidePrev = document.querySelector(".slide__edge--prev");
const slideNext = document.querySelector(".slide__edge--next");
const progressBars = document.querySelectorAll(".slide__progress-bar");

if (slideTrack && slidePrev && slideNext) {
  const originalFrames = Array.from(slideTrack.querySelectorAll(".slide__frame"));
  const totalSlides = originalFrames.length;
  const SLIDE_DURATION = 5000; // мс на один слайд

  // Клоны для бесконечной прокрутки
  const firstClone = originalFrames[0].cloneNode(true);
  const lastClone = originalFrames[totalSlides - 1].cloneNode(true);
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  slideTrack.prepend(lastClone);
  slideTrack.append(firstClone);

  let currentSlide = 1; // 1 = первый реальный слайд (0 — клон последнего)
  let isAnimating = false;
  let autoTimer = null;
  let progressTimer = null;
  let progressStart = null;
  let progressElapsed = 0;

  const moveToSlide = (index, animate = true) => {
    if (!animate) slideTrack.classList.add("is-resetting");
    slideTrack.style.transform = `translateX(-${index * 100}%)`;
    if (!animate) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slideTrack.classList.remove("is-resetting");
      }));
    }
  };

  // --- Прогресс-бары ---
  const stopProgress = () => {
    clearTimeout(autoTimer);
    cancelAnimationFrame(progressTimer);
    progressStart = null;
  };
  const updateBars = (activeIndex) => {
    progressBars.forEach((bar, i) => {
      const span = bar.querySelector("span");
      if (i < activeIndex) {
        // пройденные — полностью заполнены
        bar.classList.add("is-done");
        span.style.width = "100%";
      } else if (i === activeIndex) {
        // текущий — сбрасываем для анимации
        bar.classList.remove("is-done");
        span.style.width = "0%";
      } else {
        // будущие — пустые
        bar.classList.remove("is-done");
        span.style.width = "0%";
      }
    });
  };
  const startProgress = (activeIndex) => {
    stopProgress();
    updateBars(activeIndex);
    const span = progressBars[activeIndex]?.querySelector("span");
    if (!span) return;

    progressElapsed = 0;
    const tick = (timestamp) => {
      if (!progressStart) progressStart = timestamp;
      progressElapsed = timestamp - progressStart;
      const pct = Math.min((progressElapsed / SLIDE_DURATION) * 100, 100);
      span.style.width = pct + "%";

      if (progressElapsed < SLIDE_DURATION) {
        progressTimer = requestAnimationFrame(tick);
      } else {
        span.style.width = "100%";
        goToSlide(1); // следующий
      }
    };
    progressTimer = requestAnimationFrame(tick);
  };

  // --- Навигация ---
  const getRealIndex = () => currentSlide - 1; // 0-based реальный индекс

  const goToSlide = (direction) => {
    if (isAnimating) return;
    isAnimating = true;
    stopProgress();
    currentSlide += direction;
    moveToSlide(currentSlide);
  };

  moveToSlide(currentSlide, false);
  startProgress(0);

  slidePrev.addEventListener("click", () => goToSlide(-1));
  slideNext.addEventListener("click", () => goToSlide(1));

  // Клик по полосе — перейти на конкретный слайд
  progressBars.forEach((bar, i) => {
    bar.addEventListener("click", () => {
      if (isAnimating) return;
      const targetSlide = i + 1;
      if (targetSlide === currentSlide) return;
      isAnimating = true;
      stopProgress();
      currentSlide = targetSlide;
      moveToSlide(currentSlide);
    });
  });

  slideTrack.addEventListener("transitionend", () => {
    isAnimating = false;

    if (currentSlide === 0) {
      currentSlide = totalSlides;
      moveToSlide(currentSlide, false);
    } else if (currentSlide === totalSlides + 1) {
      currentSlide = 1;
      moveToSlide(currentSlide, false);
    }

    startProgress(getRealIndex());
  });

  // Пауза при скрытой вкладке
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopProgress();
    } else {
      startProgress(getRealIndex());
    }
  });
}

const menuToggle = document.querySelector(".nav__menu");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");

const openMenu = () => {
    menuOverlay.classList.add("is-open");
    document.body.classList.add("menu-is-open");
};

const closeMenu = () => {
    menuOverlay.classList.remove("is-open");
    document.body.classList.remove("menu-is-open");
};

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);

// Клик на тёмный фон справа закрывает меню
menuOverlay.addEventListener("click", (e) => {
    if (e.target === menuOverlay) closeMenu();
});

// Закрытие по Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
});

// --- Travel слайдер ---
const travelTrack = document.querySelector(".travel__track");
const travelPrev = document.querySelector(".travel__edge--prev");
const travelNext = document.querySelector(".travel__edge--next");

if (travelTrack) {
    const frames = Array.from(travelTrack.querySelectorAll(".travel__frame"));
    const total = frames.length;
    let current = 0;

    const getFrameWidth = () => {
        const frame = frames[0];
        const style = getComputedStyle(travelTrack);
        const gap = parseFloat(style.gap) || 16;
        return frame.offsetWidth + gap;
    };

    const moveTo = (index, animate = true) => {
        if (!animate) travelTrack.classList.add("is-resetting");
        const offset = index * getFrameWidth();
        travelTrack.style.transform = `translateX(-${offset}px)`;
        if (!animate) {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                travelTrack.classList.remove("is-resetting");
            }));
        }
    };

    const goNext = () => {
        if (current < total - 1) {
            current++;
            moveTo(current);
        }
    };

    const goPrev = () => {
        if (current > 0) {
            current--;
            moveTo(current);
        }
    };

    if (travelPrev) travelPrev.addEventListener("click", goPrev);
    if (travelNext) travelNext.addEventListener("click", goNext);

    // Свайп для мобильных
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragOffset = 0;

    travelTrack.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = false;
    }, { passive: true });

    travelTrack.addEventListener("touchmove", (e) => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (!isDragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
            isDragging = true;
            travelTrack.classList.add("is-dragging");
        }
        if (isDragging) e.preventDefault();
    }, { passive: false });

    travelTrack.addEventListener("touchend", (e) => {
        if (!isDragging) return;
        travelTrack.classList.remove("is-dragging");
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -40) goNext();
        else if (dx > 40) goPrev();
        else moveTo(current);
        isDragging = false;
    });

    // Перерасчёт при ресайзе
    window.addEventListener("resize", () => moveTo(current, false));
}