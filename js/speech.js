// ============================================
// speech.js — Web Speech API Wrapper for Arabic
// رحلة مصطفى — Mostafa's Journey
// ============================================

const Speech = (() => {
  let supported = false;
  let arabicVoice = null;
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    supported = 'speechSynthesis' in window;
    if (supported) {
      loadVoices();
      // Chrome loads voices async
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    // Prefer Arabic voices, Egyptian first
    arabicVoice = voices.find(v => v.lang === 'ar-EG') ||
                  voices.find(v => v.lang === 'ar-SA') ||
                  voices.find(v => v.lang.startsWith('ar')) ||
                  null;
  }

  function isSupported() {
    return supported;
  }

  function isEnabled() {
    const settings = Storage.getSettings();
    return settings.speechEnabled && supported;
  }

  // Core speak function
  function speak(text, options = {}) {
    if (!isEnabled()) return Promise.resolve();

    return new Promise((resolve) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'ar-SA';
      utterance.rate = options.rate || 0.85;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = resolve;
      utterance.onerror = resolve;

      speechSynthesis.speak(utterance);
    });
  }

  // Speak a letter with its name
  function speakLetter(char, name) {
    return speak(`${char}... ${name}`, { rate: 0.7 });
  }

  // Speak a number
  function speakNumber(word) {
    return speak(word, { rate: 0.8 });
  }

  // Speak Quran text (slower, more reverent)
  function speakQuran(text) {
    return speak(text, { rate: 0.6, pitch: 0.95 });
  }

  // Speak encouragement
  function speakEncouragement(text) {
    return speak(text, { rate: 0.9, pitch: 1.1 });
  }

  // Speak animal name
  function speakAnimal(name) {
    return speak(name, { rate: 0.75 });
  }

  // Speak color name
  function speakColor(name) {
    return speak(name, { rate: 0.8 });
  }

  // Stop speaking
  function stop() {
    if (supported) {
      speechSynthesis.cancel();
    }
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    isSupported,
    isEnabled,
    speak,
    speakLetter,
    speakNumber,
    speakQuran,
    speakEncouragement,
    speakAnimal,
    speakColor,
    stop
  };
})();
