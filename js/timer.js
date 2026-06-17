// ============================================
// timer.js — Flexible 15-Minute Phase Timer
// رحلة مصطفى — Mostafa's Journey
// ============================================

const Timer = (() => {
  // Phase definitions
  const PHASES = [
    { id: 'warmup', name: 'التحمية', nameEn: 'Warm-up', emoji: '🌟', suggestedMinutes: 2 },
    { id: 'main', name: 'النشاط الرئيسي', nameEn: 'Main Activity', emoji: '📚', suggestedMinutes: 7 },
    { id: 'behavior', name: 'مهارة سلوكية', nameEn: 'Behavior Skill', emoji: '🤝', suggestedMinutes: 2 },
    { id: 'quran', name: 'القرآن الكريم', nameEn: 'Quran', emoji: '📖', suggestedMinutes: 2 },
    { id: 'closing', name: 'الختام', nameEn: 'Closing', emoji: '🎉', suggestedMinutes: 2 }
  ];

  let state = {
    currentPhase: 0,
    phaseStartTime: null,
    elapsedSeconds: 0,
    totalElapsedSeconds: 0,
    isRunning: false,
    isPaused: false,
    intervalId: null,
    onTick: null,
    onPhaseTimeUp: null,
    onComplete: null
  };

  function getPhases() {
    return PHASES;
  }

  function getCurrentPhase() {
    return PHASES[state.currentPhase] || null;
  }

  function getCurrentPhaseIndex() {
    return state.currentPhase;
  }

  function getPhaseElapsedSeconds() {
    return state.elapsedSeconds;
  }

  function getTotalElapsedSeconds() {
    return state.totalElapsedSeconds;
  }

  function getPhaseSuggestedSeconds() {
    const phase = PHASES[state.currentPhase];
    return phase ? phase.suggestedMinutes * 60 : 0;
  }

  function isPhaseTimeUp() {
    return state.elapsedSeconds >= getPhaseSuggestedSeconds();
  }

  function getPhaseProgress() {
    const suggested = getPhaseSuggestedSeconds();
    if (suggested === 0) return 1;
    return Math.min(state.elapsedSeconds / suggested, 1);
  }

  function getTotalProgress() {
    const totalSuggested = PHASES.reduce((sum, p) => sum + p.suggestedMinutes * 60, 0);
    return Math.min(state.totalElapsedSeconds / totalSuggested, 1);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function getPhaseRemainingFormatted() {
    const suggested = getPhaseSuggestedSeconds();
    const remaining = Math.max(0, suggested - state.elapsedSeconds);
    return formatTime(remaining);
  }

  function getTotalRemainingFormatted() {
    const totalSuggested = PHASES.reduce((sum, p) => sum + p.suggestedMinutes * 60, 0);
    const remaining = Math.max(0, totalSuggested - state.totalElapsedSeconds);
    return formatTime(remaining);
  }

  function tick() {
    if (!state.isRunning || state.isPaused) return;

    state.elapsedSeconds += 1;
    state.totalElapsedSeconds += 1;

    // Check if phase suggested time is up
    if (state.elapsedSeconds === getPhaseSuggestedSeconds()) {
      if (state.onPhaseTimeUp) {
        state.onPhaseTimeUp(state.currentPhase, PHASES[state.currentPhase]);
      }
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    if (state.onTick) {
      state.onTick({
        phase: state.currentPhase,
        phaseData: PHASES[state.currentPhase],
        phaseElapsed: state.elapsedSeconds,
        totalElapsed: state.totalElapsedSeconds,
        phaseProgress: getPhaseProgress(),
        totalProgress: getTotalProgress(),
        phaseTimeUp: isPhaseTimeUp(),
        phaseRemaining: getPhaseRemainingFormatted(),
        totalRemaining: getTotalRemainingFormatted()
      });
    }
  }

  function start(callbacks = {}) {
    state.currentPhase = 0;
    state.elapsedSeconds = 0;
    state.totalElapsedSeconds = 0;
    state.isRunning = true;
    state.isPaused = false;
    state.onTick = callbacks.onTick || null;
    state.onPhaseTimeUp = callbacks.onPhaseTimeUp || null;
    state.onComplete = callbacks.onComplete || null;

    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = setInterval(tick, 1000);

    // Initial tick
    if (state.onTick) {
      state.onTick({
        phase: 0,
        phaseData: PHASES[0],
        phaseElapsed: 0,
        totalElapsed: 0,
        phaseProgress: 0,
        totalProgress: 0,
        phaseTimeUp: false,
        phaseRemaining: formatTime(PHASES[0].suggestedMinutes * 60),
        totalRemaining: formatTime(PHASES.reduce((s, p) => s + p.suggestedMinutes * 60, 0))
      });
    }
  }

  function nextPhase() {
    if (state.currentPhase < PHASES.length - 1) {
      state.currentPhase += 1;
      state.elapsedSeconds = 0;
      return PHASES[state.currentPhase];
    } else {
      // All phases complete
      stop();
      if (state.onComplete) {
        state.onComplete();
      }
      return null;
    }
  }

  function previousPhase() {
    if (state.currentPhase > 0) {
      state.currentPhase -= 1;
      state.elapsedSeconds = 0;
      return PHASES[state.currentPhase];
    }
    return PHASES[0];
  }

  function goToPhase(index) {
    if (index >= 0 && index < PHASES.length) {
      state.currentPhase = index;
      state.elapsedSeconds = 0;
      return PHASES[index];
    }
    return null;
  }

  function pause() {
    state.isPaused = true;
  }

  function resume() {
    state.isPaused = false;
  }

  function togglePause() {
    state.isPaused = !state.isPaused;
    return state.isPaused;
  }

  function stop() {
    state.isRunning = false;
    state.isPaused = false;
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function isRunning() {
    return state.isRunning;
  }

  function isPaused() {
    return state.isPaused;
  }

  function isLastPhase() {
    return state.currentPhase === PHASES.length - 1;
  }

  return {
    getPhases,
    getCurrentPhase,
    getCurrentPhaseIndex,
    getPhaseElapsedSeconds,
    getTotalElapsedSeconds,
    getPhaseSuggestedSeconds,
    isPhaseTimeUp,
    getPhaseProgress,
    getTotalProgress,
    formatTime,
    getPhaseRemainingFormatted,
    getTotalRemainingFormatted,
    start,
    nextPhase,
    previousPhase,
    goToPhase,
    pause,
    resume,
    togglePause,
    stop,
    isRunning,
    isPaused,
    isLastPhase
  };
})();
