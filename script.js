(() => {
  "use strict";

  /* ------------------------------------------------------------------
     Persian numerals
     ------------------------------------------------------------------ */
  const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  function toPersianDigits(input) {
    return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
  }

  function pad2(n) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  /* ------------------------------------------------------------------
     Countdown
     ------------------------------------------------------------------ */
  const COUNTDOWN_KEY = "arta_launch_target";
  const INITIAL_MS =
    (7 * 24 * 60 * 60 + 7 * 60 * 60 + 9 * 60 + 20) * 1000;

  function getTargetTime() {
    const stored = localStorage.getItem(COUNTDOWN_KEY);
    if (stored) {
      const t = Number(stored);
      if (!Number.isNaN(t) && t > Date.now()) return t;
    }
    const target = Date.now() + INITIAL_MS;
    try {
      localStorage.setItem(COUNTDOWN_KEY, String(target));
    } catch (e) {
      /* storage unavailable — countdown still runs in-memory */
    }
    return target;
  }

  const targetTime = getTargetTime();

  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
  };

  function renderCountdown() {
    const remainingMs = Math.max(0, targetTime - Date.now());
    const totalSeconds = Math.floor(remainingMs / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    els.days.textContent = toPersianDigits(pad2(days));
    els.hours.textContent = toPersianDigits(pad2(hours));
    els.minutes.textContent = toPersianDigits(pad2(minutes));
    els.seconds.textContent = toPersianDigits(pad2(seconds));

    if (remainingMs <= 0) {
      clearInterval(countdownInterval);
    }
  }

  renderCountdown();
  const countdownInterval = setInterval(renderCountdown, 1000);

  /* ------------------------------------------------------------------
     Curiosity copy — rotates sparingly, never repeats "به زودی"
     ------------------------------------------------------------------ */
  const CURIOSITY_LINES = [
    "هنوز چیزی برای گفتن نداریم.",
    "اما زمان زیادی باقی نمانده است.",
    "اگر جای شما بودیم، این صفحه را فراموش نمی‌کردیم.",
  ];

  const curiosityEl = document.getElementById("curiosity-line");
  let curiosityIndex = 0;

  function rotateCuriosity() {
    curiosityEl.classList.add("is-fading");
    window.setTimeout(() => {
      curiosityIndex = (curiosityIndex + 1) % CURIOSITY_LINES.length;
      curiosityEl.textContent = CURIOSITY_LINES[curiosityIndex];
      curiosityEl.classList.remove("is-fading");
    }, 600);
  }

  window.setInterval(rotateCuriosity, 7000);

  /* ------------------------------------------------------------------
     Afghan phone number handling
     ------------------------------------------------------------------ */
  const phoneInput = document.getElementById("phone-input");
  const phoneFeedback = document.getElementById("phone-feedback");
  const form = document.getElementById("reminder-form");
  const successState = document.getElementById("success-state");
  const whatsappLink = document.getElementById("whatsapp-link");
  const telegramLink = document.getElementById("telegram-link");

  // Afghan mobile numbers: 9 digits after the country code, starting with 7.
  const AFGHAN_MOBILE_PATTERN = /^7[0-9]{8}$/;

  function sanitizeDigits(raw) {
    let digits = raw.replace(/[^\d۰-۹]/g, "");
    // Normalize any Persian/Arabic-indic digits a user might paste in.
    digits = digits.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.startsWith("93")) digits = digits.slice(2);
    return digits.slice(0, 9);
  }

  function formatAfghanNumber(digits) {
    // +93 7XX XXX XXX
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)];
    return parts.filter(Boolean).join(" ");
  }

  phoneInput.addEventListener("input", () => {
    const digits = sanitizeDigits(phoneInput.value);
    phoneInput.value = formatAfghanNumber(digits);
    setFeedback("", null);
  });

  function setFeedback(message, state) {
    phoneFeedback.textContent = message;
    if (state) {
      phoneFeedback.setAttribute("data-state", state);
    } else {
      phoneFeedback.removeAttribute("data-state");
    }
  }

  /* ------------------------------------------------------------------
     Storage — isolated so a real backend can replace it later
     ------------------------------------------------------------------ */
  const STORAGE_KEY = "arta_reminders";

  function saveReminder(phone) {
    let list = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch (e) {
      list = [];
    }
    list.push({ phone, timestamp: new Date().toISOString() });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* storage full or unavailable — submission still succeeds visually */
    }
  }

  function buildContactLinks(fullPhone) {
    const message = encodeURIComponent(
      "سلام، می‌خواهم هنگام آغاز آرتا مطلع شوم."
    );
    const waNumber = fullPhone.replace("+", "");
    whatsappLink.href = `https://wa.me/${waNumber}?text=${message}`;
    telegramLink.href = `https://t.me/share/url?url=https://arta.example&text=${message}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const digits = sanitizeDigits(phoneInput.value);

    if (!AFGHAN_MOBILE_PATTERN.test(digits)) {
      setFeedback("لطفاً یک شماره معتبر افغانستان وارد کنید.", "error");
      phoneInput.focus();
      return;
    }

    const fullPhone = `+93${digits}`;
    saveReminder(fullPhone);
    buildContactLinks(fullPhone);

    setFeedback("", null);
    form.hidden = true;
    successState.hidden = false;
    successState.focus?.();
  });
})();
