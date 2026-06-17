// ============================================
// app.js — Main Application Controller
// رحلة مصطفى — Mostafa's Journey
// Handles Routing, UI Rendering, Event Delegation
// ============================================

const App = (() => {
  // UI Elements cache
  const el = {
    container: document.getElementById('app-container'),
    sections: {},
    navItems: document.querySelectorAll('.nav-item'),
    bottomNav: document.querySelector('.nav-bottom'),
    
    // Welcome View
    welcomeForm: document.getElementById('welcome-form'),
    welcomeNameInput: document.getElementById('welcome-name'),
    emojiBtns: document.querySelectorAll('.emoji-btn'),
    selectedEmoji: '👦',

    // Dashboard View
    dashChildName: document.getElementById('dash-child-name'),
    dashChildEmoji: document.getElementById('dash-child-emoji'),
    dashStreak: document.getElementById('dash-streak'),
    dashProgressRing: document.getElementById('dash-progress-ring'),
    dashTodayPreview: document.getElementById('dash-today-preview'),
    dashStartBtn: document.getElementById('dash-start-btn'),

    // Journey View
    calendarMap: document.getElementById('calendar-map'),

    // Lesson View
    lessonTitle: document.getElementById('lesson-title'),
    lessonPhaseDots: document.getElementById('lesson-phase-dots'),
    lessonPhaseCard: document.getElementById('lesson-phase-card'),
    lessonProgressFill: document.getElementById('lesson-progress-fill'),
    lessonTimerDisplay: document.getElementById('lesson-timer-display'),
    lessonTotalTimerDisplay: document.getElementById('lesson-total-timer-display'),
    lessonBackBtn: document.getElementById('lesson-back-btn'),
    lessonPrevPhaseBtn: document.getElementById('lesson-prev-phase-btn'),
    lessonNextPhaseBtn: document.getElementById('lesson-next-phase-btn'),

    // Activities View
    activitiesGrid: document.getElementById('activities-grid'),
    filterTabs: document.getElementById('filter-tabs'),

    // Activity Detail View
    activityDetailContent: document.getElementById('activity-detail-content'),

    // Achievements View
    achBadgeCount: document.getElementById('ach-badge-count'),
    achProgressRing: document.getElementById('ach-progress-ring'),
    achBadgesGrid: document.getElementById('ach-badges-grid'),
    achGraduationSection: document.getElementById('ach-graduation-section'),

    // Settings View
    settingSpeechToggle: document.getElementById('setting-speech'),
    settingThemeToggle: document.getElementById('setting-theme'),
    settingsProfilesList: document.getElementById('settings-profiles-list'),
    settingsProfileForm: document.getElementById('settings-profile-form'),
    settingsProfileName: document.getElementById('settings-profile-name'),
    settingsProfileEmoji: '👦',
    settingsEmojiBtns: document.querySelectorAll('.settings-emoji-btn'),
    exportBtn: document.getElementById('export-data-btn'),
    importFile: document.getElementById('import-data-file'),

    // Modals
    modalOverlay: document.getElementById('modal-overlay'),
    modalContent: document.getElementById('modal-content')
  };

  let activeView = 'dashboard';
  let activeLessonDay = 1;
  let activePhaseIndex = 0;
  let selectedActivityId = null;

  // Initialize App
  function init() {
    // Cache all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      el.sections[sec.dataset.view] = sec;
    });

    // Setup Theme
    const currentTheme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (el.settingThemeToggle) {
      el.settingThemeToggle.checked = (currentTheme === 'dark');
    }

    // Setup Speech toggle
    if (el.settingSpeechToggle) {
      el.settingSpeechToggle.checked = Storage.getSettings().speechEnabled;
    }

    // Listen to hash changes for routing
    window.addEventListener('hashchange', handleRoute);
    
    // Bind Event Listeners
    bindEvents();

    // Initial Route check
    handleRoute();
  }

  // Router
  function handleRoute() {
    const hash = window.location.hash || '#/dashboard';
    
    // Stop TTS on navigation
    Speech.stop();
    // Stop active lesson timer if we navigate away
    if (activeView === 'lesson' && !hash.startsWith('#/lesson')) {
      Timer.stop();
    }

    // First, check if profiles exist
    if (!Storage.hasProfiles() && hash !== '#/welcome') {
      window.location.hash = '#/welcome';
      return;
    }

    if (hash === '#/welcome') {
      switchView('welcome');
      renderWelcome();
    } else if (hash === '#/dashboard') {
      switchView('dashboard');
      renderDashboard();
    } else if (hash === '#/journey') {
      switchView('journey');
      renderJourney();
    } else if (hash.startsWith('#/lesson/')) {
      const parts = hash.split('/');
      const day = parseInt(parts[2]) || 1;
      activeLessonDay = day;
      switchView('lesson');
      startLesson(day);
    } else if (hash === '#/activities') {
      switchView('activities');
      renderActivitiesList();
    } else if (hash.startsWith('#/activity/')) {
      const parts = hash.split('/');
      selectedActivityId = parts[2];
      switchView('activity-detail');
      renderActivityDetail(selectedActivityId);
    } else if (hash === '#/achievements') {
      switchView('achievements');
      renderAchievements();
    } else if (hash === '#/settings') {
      switchView('settings');
      renderSettings();
    } else {
      window.location.hash = '#/dashboard';
    }
  }

  // Switch View
  function switchView(viewName) {
    activeView = viewName;
    
    // Show/hide section containers
    Object.keys(el.sections).forEach(name => {
      if (name === viewName) {
        el.sections[name].classList.add('active');
      } else {
        el.sections[name].classList.remove('active');
      }
    });

    // Update Bottom Nav active state
    el.navItems.forEach(item => {
      const target = item.dataset.target;
      // Map view name to nav item targets
      const isMatch = (target === viewName) ||
                      (target === 'journey' && viewName === 'lesson') ||
                      (target === 'activities' && viewName === 'activity-detail');
      
      if (isMatch) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Show/Hide bottom navigation bar based on view
    if (viewName === 'welcome' || viewName === 'lesson') {
      el.bottomNav.style.display = 'none';
      el.container.style.paddingBottom = '0px';
    } else {
      el.bottomNav.style.display = 'flex';
      el.container.style.paddingBottom = 'calc(var(--nav-height) + 20px)';
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Event Binding
  function bindEvents() {
    // Welcome Emoji Picker
    el.emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.emojiBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        el.selectedEmoji = btn.dataset.emoji;
      });
    });

    // Welcome Form Submit
    if (el.welcomeForm) {
      el.welcomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = el.welcomeNameInput.value.trim();
        if (!name) return;

        Storage.createProfile(name, el.selectedEmoji, 3);
        window.location.hash = '#/dashboard';
      });
    }

    // Settings Emoji Picker
    el.settingsEmojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.settingsEmojiBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        el.settingsProfileEmoji = btn.dataset.emoji;
      });
    });

    // Settings Profile Form Submit
    if (el.settingsProfileForm) {
      el.settingsProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = el.settingsProfileName.value.trim();
        if (!name) return;

        if (!Storage.canAddProfile()) {
          alert('عذراً، الحد الأقصى للملفات الشخصية هو ٢.');
          return;
        }

        Storage.createProfile(name, el.settingsProfileEmoji, 3);
        el.settingsProfileName.value = '';
        renderSettings();
      });
    }

    // Navigation Buttons click handlers
    el.navItems.forEach(item => {
      item.addEventListener('click', () => {
        window.location.hash = `#/${item.dataset.target}`;
      });
    });

    // Settings Theme Toggle
    if (el.settingThemeToggle) {
      el.settingThemeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        Storage.setTheme(theme);
      });
    }

    // Settings Speech Toggle
    if (el.settingSpeechToggle) {
      el.settingSpeechToggle.addEventListener('change', (e) => {
        Storage.updateSettings({ speechEnabled: e.target.checked });
      });
    }

    // Export Data
    if (el.exportBtn) {
      el.exportBtn.addEventListener('click', () => {
        const dataStr = Storage.exportData();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `رحلة_مصطفى_نسخة_احتياطية_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      });
    }

    // Import Data
    if (el.importFile) {
      el.importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          const success = Storage.importData(evt.target.result);
          if (success) {
            alert('تم استيراد البيانات بنجاح!');
            window.location.hash = '#/dashboard';
            location.reload();
          } else {
            alert('فشل استيراد البيانات. يرجى التأكد من صحة الملف.');
          }
        };
        reader.readAsText(file);
      });
    }

    // Close Modal Overlay on background click
    el.modalOverlay.addEventListener('click', (e) => {
      if (e.target === el.modalOverlay) {
        closeModal();
      }
    });

    // Setup global audio tap to speak letters, numbers, etc.
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tts-speak')) {
        const text = e.target.dataset.tts;
        const type = e.target.dataset.ttsCc || 'speak';
        if (text) {
          if (type === 'letter') {
            Speech.speakLetter(text, e.target.dataset.ttsName || '');
          } else if (type === 'number') {
            Speech.speakNumber(text);
          } else if (type === 'quran') {
            Speech.speakQuran(text);
          } else if (type === 'animal') {
            Speech.speakAnimal(text);
          } else if (type === 'color') {
            Speech.speakColor(text);
          } else {
            Speech.speak(text);
          }
        }
      }
    });
  }

  // Render Welcome setup screen
  function renderWelcome() {
    el.welcomeNameInput.value = '';
    el.emojiBtns.forEach(b => b.classList.remove('selected'));
    el.emojiBtns[0].classList.add('selected');
    el.selectedEmoji = '👦';
  }

  // Render Dashboard main view
  function renderDashboard() {
    const profile = Storage.getActiveProfile();
    if (!profile) return;

    el.dashChildName.textContent = profile.name;
    el.dashChildEmoji.textContent = profile.emoji;
    
    // Streak
    const streak = Storage.getStreak();
    el.dashStreak.innerHTML = `<span>🔥</span> ${streak} ${streak === 1 ? 'يوم' : streak >= 3 && streak <= 10 ? 'أيام' : 'يوماً'} متواصلين`;
    if (streak > 0) {
      el.dashStreak.classList.add('active');
    } else {
      el.dashStreak.classList.remove('active');
    }

    // Progress circle SVG calculations
    const progress = Storage.getProgress();
    const completedDays = progress.completedDays.length;
    const currentDay = progress.currentDay;
    
    const circle = el.dashProgressRing.querySelector('.progress-ring-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const percentage = completedDays / 30;
    const offset = circumference - (percentage * circumference);
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    
    el.dashProgressRing.querySelector('.progress-val').textContent = `${completedDays}`;

    // Active day preview card
    const todayData = DaysData.find(d => d.day === currentDay) || DaysData[0];
    
    let isTodayCompleted = Storage.isDayCompleted(currentDay);
    let previewHtml = '';
    
    if (isTodayCompleted) {
      previewHtml = `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 3rem; margin-bottom: 10px;">🌟</div>
          <h3>رائع يا ${profile.name}! لقد أكملت درس اليوم (${currentDay})</h3>
          <p style="margin-top: 8px;">تقدر تراجع اللي اتعلمناه النهارده أو تشوف رحلتك في قائمة الأيام.</p>
        </div>
      `;
      el.dashStartBtn.textContent = `مراجعة اليوم ${currentDay}`;
      el.dashStartBtn.className = 'btn btn-secondary';
    } else {
      previewHtml = `
        <div style="display: flex; justify-content: space-around; width: 100%; margin-top: 10px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">حرف اليوم</span>
            <span class="tts-speak" data-tts="${todayData.letter.char}" data-tts-cc="letter" data-tts-name="${todayData.letter.name}" style="font-size: 2.25rem; font-weight: 800; color: var(--primary); cursor: pointer;">${todayData.letter.char}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">رقم اليوم</span>
            <span class="tts-speak" data-tts="${todayData.number.word}" data-tts-cc="number" style="font-size: 2.25rem; font-weight: 800; color: var(--primary); cursor: pointer; font-family: var(--font-inter);">${todayData.number.value}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">لون اليوم</span>
            <span class="tts-speak" data-tts="${todayData.color.name}" data-tts-cc="color" style="width: 30px; height: 30px; border-radius: 50%; background-color: ${todayData.color.hex}; border: 1.5px solid var(--border-color); cursor: pointer; box-shadow: var(--shadow-sm);"></span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">حيوان اليوم</span>
            <span class="tts-speak" data-tts="${todayData.animal.name}" data-tts-cc="animal" style="font-size: 2rem; cursor: pointer;">${todayData.animal.emoji}</span>
          </div>
        </div>
      `;
      el.dashStartBtn.textContent = `ابدأ درس اليوم ${currentDay}`;
      el.dashStartBtn.className = 'btn btn-primary';
    }

    el.dashTodayPreview.innerHTML = previewHtml;

    // Start button logic
    el.dashStartBtn.onclick = () => {
      window.location.hash = `#/lesson/${currentDay}`;
    };
  }

  // Render Journey/Calendar map view
  function renderJourney() {
    const progress = Storage.getProgress();
    const currentDay = progress.currentDay;
    
    el.calendarMap.innerHTML = '';
    
    DaysData.forEach(dayData => {
      const node = document.createElement('div');
      node.className = 'calendar-day-node';
      
      const isCompleted = progress.completedDays.includes(dayData.day);
      const isActive = dayData.day === currentDay;
      const isLocked = dayData.day > currentDay;
      
      if (isCompleted) {
        node.classList.add('completed');
        node.innerHTML = `
          <span class="day-num numbers-font">${dayData.day}</span>
          <span class="day-label">يوم</span>
          <span class="day-icon">✅</span>
        `;
      } else if (isActive) {
        node.classList.add('active');
        node.innerHTML = `
          <span class="day-num numbers-font">${dayData.day}</span>
          <span class="day-label">الآن</span>
          <span class="day-icon">${dayData.letter.char}</span>
        `;
      } else {
        node.classList.add('locked');
        node.innerHTML = `
          <span class="day-num numbers-font">${dayData.day}</span>
          <span class="day-label">قفل</span>
          <span class="day-icon">🔒</span>
        `;
      }

      node.addEventListener('click', () => {
        // Let them explore any active or completed days
        if (!isLocked) {
          window.location.hash = `#/lesson/${dayData.day}`;
        } else {
          // Speak gentle notification
          Speech.speak('هذا اليوم مقفول حالياً يا بطل، خلص دروسك أولاً!');
        }
      });
      
      el.calendarMap.appendChild(node);
    });
  }

  // Lesson Controller Flow
  function startLesson(dayNumber) {
    const dayData = DaysData.find(d => d.day === dayNumber);
    if (!dayData) {
      window.location.hash = '#/dashboard';
      return;
    }

    el.lessonTitle.textContent = `اليوم ${dayNumber} — رحلة التعلم`;
    activePhaseIndex = 0;

    // Setup Phase Dots click handlers
    el.lessonPhaseDots.innerHTML = '';
    const phases = Timer.getPhases();
    phases.forEach((phase, index) => {
      const dot = document.createElement('button');
      dot.className = 'phase-dot';
      dot.textContent = phase.emoji;
      dot.title = phase.name;
      dot.onclick = () => {
        switchLessonPhase(index, dayData);
      };
      el.lessonPhaseDots.appendChild(dot);
    });

    // Start the global 15-minute Timer
    Timer.start({
      onTick: (timerState) => {
        el.lessonTimerDisplay.textContent = timerState.phaseRemaining;
        el.lessonTotalTimerDisplay.textContent = `الوقت الكلي المتبقي: ${timerState.totalRemaining}`;
        
        // Update timer progress bar
        el.lessonProgressFill.style.width = `${timerState.phaseProgress * 100}%`;
        
        if (timerState.phaseTimeUp) {
          el.lessonTimerDisplay.classList.add('overtime');
        } else {
          el.lessonTimerDisplay.classList.remove('overtime');
        }

        // Highlight phase dots
        const dots = el.lessonPhaseDots.children;
        for (let i = 0; i < dots.length; i++) {
          if (i === timerState.phase) {
            dots[i].className = 'phase-dot active';
          } else if (i < timerState.phase) {
            dots[i].className = 'phase-dot completed';
          } else {
            dots[i].className = 'phase-dot';
          }
        }
        
        // Synch state index
        if (activePhaseIndex !== timerState.phase) {
          activePhaseIndex = timerState.phase;
          renderPhaseContent(activePhaseIndex, dayData);
        }
      },
      onPhaseTimeUp: (phaseIdx, phaseData) => {
        // Voice reminder when time suggests to move
        Speech.speakEncouragement(`يلا بينا ننقل للنشاط اللي بعده يا بطل!`);
      },
      onComplete: () => {
        finishLesson(dayNumber);
      }
    });

    // Back to dashboard confirmation
    el.lessonBackBtn.onclick = () => {
      if (confirm('هل أنت متأكد من الخروج وإيقاف وقت الدرس؟')) {
        Timer.stop();
        window.location.hash = '#/dashboard';
      }
    };

    // Render phase 0
    renderPhaseContent(0, dayData);
    switchLessonPhase(0, dayData);
  }

  function switchLessonPhase(phaseIndex, dayData) {
    Timer.goToPhase(phaseIndex);
    activePhaseIndex = phaseIndex;
    renderPhaseContent(phaseIndex, dayData);
  }

  // Render content of active lesson phase
  function renderPhaseContent(phaseIndex, dayData) {
    const phase = Timer.getPhases()[phaseIndex];
    
    // Hide/show prev/next buttons
    el.lessonPrevPhaseBtn.style.display = phaseIndex === 0 ? 'none' : 'inline-flex';
    if (phaseIndex === 4) {
      el.lessonNextPhaseBtn.textContent = 'إنهاء الدرس 🎉';
      el.lessonNextPhaseBtn.className = 'btn btn-success';
    } else {
      el.lessonNextPhaseBtn.textContent = 'المرحلة التالية ➔';
      el.lessonNextPhaseBtn.className = 'btn btn-primary';
    }

    el.lessonPrevPhaseBtn.onclick = () => {
      switchLessonPhase(phaseIndex - 1, dayData);
    };

    el.lessonNextPhaseBtn.onclick = () => {
      if (phaseIndex === 4) {
        finishLesson(dayData.day);
      } else {
        switchLessonPhase(phaseIndex + 1, dayData);
      }
    };

    let contentHtml = '';

    switch (phase.id) {
      case 'warmup':
        contentHtml = `
          <div class="curriculum-display">
            <span class="welcome-logo" style="font-size: 4.5rem;">${dayData.letter.emoji}</span>
            <h2 class="tts-speak" data-tts="${dayData.warmup.greeting}" style="cursor:pointer; color: var(--primary); font-size: 1.5rem;">${dayData.warmup.greeting}</h2>
            <p class="tts-speak" data-tts="${dayData.warmup.theme}" style="font-size: 1.15rem; cursor:pointer; margin-top: 10px; padding: 0 10px;">${dayData.warmup.theme}</p>
            <button class="btn btn-outline btn-sm tts-speak" data-tts="${dayData.warmup.greeting}. ${dayData.warmup.theme}" style="margin-top: 15px;">
              <span>🔊</span> اسمع الترحيب
            </button>
          </div>
        `;
        // Speak automatically on entry
        Speech.speak(`${dayData.warmup.greeting}. ${dayData.warmup.theme}`);
        break;

      case 'main':
        contentHtml = `
          <div class="curriculum-display" style="gap: 15px; text-align: center; width: 100%;">
            
            <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              
              <!-- Letter card -->
              <div class="card" style="display:flex; flex-direction:column; align-items:center; padding:12px;">
                <span style="font-size:0.75rem; color:var(--text-secondary);">حرف اليوم (اضغط عليه)</span>
                <span class="card-big-char tts-speak" data-tts="${dayData.letter.char}" data-tts-cc="letter" data-tts-name="${dayData.letter.name}">${dayData.letter.char}</span>
                <span style="font-size:1rem; font-weight:700; margin-top:5px;">${dayData.letter.name}</span>
                <span style="font-size:0.85rem; color:var(--text-secondary);">${dayData.letter.word} ${dayData.letter.emoji}</span>
              </div>
              
              <!-- Number card -->
              <div class="card" style="display:flex; flex-direction:column; align-items:center; padding:12px;">
                <span style="font-size:0.75rem; color:var(--text-secondary);">رقم اليوم (اضغط عليه)</span>
                <span class="card-big-number tts-speak" data-tts="${dayData.number.word}" data-tts-cc="number">${dayData.number.value}</span>
                <span style="font-size:1rem; font-weight:700; margin-top:5px;">${dayData.number.word}</span>
                <span style="font-size:1rem; margin-top:2px;">${dayData.number.emoji}</span>
              </div>

            </div>

            <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              
              <!-- Color card -->
              <div class="card" style="display:flex; flex-direction:column; align-items:center; padding:12px;">
                <span style="font-size:0.75rem; color:var(--text-secondary);">لون اليوم (اضغط عليه)</span>
                <div class="color-swatch-circle tts-speak" data-tts="${dayData.color.name}" data-tts-cc="color" style="background-color: ${dayData.color.hex}; cursor:pointer; width:54px; height:54px;"></div>
                <span style="font-size:0.95rem; font-weight:700;">${dayData.color.name}</span>
                <span style="font-size:0.75rem; color:var(--text-secondary); text-align:center;">${dayData.color.activity}</span>
              </div>
              
              <!-- Animal card -->
              <div class="card" style="display:flex; flex-direction:column; align-items:center; padding:12px;">
                <span style="font-size:0.75rem; color:var(--text-secondary);">حيوان اليوم (اضغط عليه)</span>
                <span class="tts-speak" data-tts="${dayData.animal.name}" data-tts-cc="animal" style="font-size:3.25rem; cursor:pointer; line-height:1.2;">${dayData.animal.emoji}</span>
                <span style="font-size:0.95rem; font-weight:700;">${dayData.animal.name}</span>
                <span style="font-size:0.7rem; color:var(--text-secondary); text-align:center; height:34px; overflow:hidden;">${dayData.animal.fact}</span>
              </div>

            </div>

            <!-- PDF printable button -->
            <button id="download-printable-btn" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 10px;">
              🖨️ تحميل ورقة العمل للطباعة (PDF)
            </button>

          </div>
        `;
        break;

      case 'behavior':
        contentHtml = `
          <div class="curriculum-display" style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 10px;">🤝</div>
            <span class="phase-badge">مهارة سلوكية</span>
            <h3 class="tts-speak" data-tts="${dayData.behavior.title}" style="cursor:pointer; margin-top: 10px; font-size: 1.35rem; color: var(--primary);">${dayData.behavior.title}</h3>
            <p class="tts-speak" data-tts="${dayData.behavior.description}" style="font-size: 1.1rem; cursor:pointer; margin-top: 8px; padding: 0 10px;">${dayData.behavior.description}</p>
            <div class="card tts-speak" data-tts="${dayData.behavior.scenario}" style="margin-top: 15px; border-style: dashed; border-color: var(--primary); background-color: var(--bg-surface-alt); cursor:pointer;">
              <span style="font-weight: 700; color: var(--primary); display:block; margin-bottom:4px;">💡 مثال للتطبيق:</span>
              <p style="font-size:0.95rem; color: var(--text-primary);">${dayData.behavior.scenario}</p>
            </div>
          </div>
        `;
        // Speak automatically
        Speech.speak(`مهارة اليوم هي: ${dayData.behavior.title}. ${dayData.behavior.description}`);
        break;

      case 'quran':
        contentHtml = `
          <div class="curriculum-display" style="text-align: center;">
            <div style="font-size: 3.5rem; margin-bottom: 5px;">🕌</div>
            <span class="phase-badge" style="background-color: var(--success-light); color: var(--success);">القرآن الكريم</span>
            <h3 style="margin-top: 8px;">سورة ${dayData.quran.surah} (${dayData.quran.ayahNumbers})</h3>
            <div class="quran-ayahs tts-speak" data-tts="${dayData.quran.ayahs}" data-tts-cc="quran" style="cursor:pointer;">
              ${dayData.quran.ayahs}
            </div>
            <p style="font-size:0.85rem; color: var(--text-secondary); font-style: italic;">
              ${dayData.quran.instruction}
            </p>
            <button class="btn btn-outline btn-sm tts-speak" data-tts="${dayData.quran.ayahs}" data-tts-cc="quran" style="margin-top: 10px; border-color: var(--success); color: var(--success);">
              📖 تلاوة الآيات ببطء
            </button>
          </div>
        `;
        // Speak automatically
        Speech.speakQuran(dayData.quran.ayahs);
        break;

      case 'closing':
        contentHtml = `
          <div class="curriculum-display" style="text-align: center;">
            <div class="welcome-logo" style="font-size: 4rem; margin-bottom: 10px;">🎓</div>
            <h2 class="tts-speak" data-tts="${dayData.closing.message}" style="cursor:pointer; color: var(--primary);">${dayData.closing.message}</h2>
            <p class="tts-speak" data-tts="${dayData.closing.encouragement}" style="font-size: 1.25rem; cursor:pointer; margin-top: 10px; padding: 0 10px; font-weight: 700;">${dayData.closing.encouragement}</p>
            <button class="btn btn-outline btn-sm tts-speak" data-tts="${dayData.closing.message}. ${dayData.closing.encouragement}" style="margin-top: 15px;">
              🌟 اسمع التشجيع
            </button>
          </div>
        `;
        // Speak automatically
        Speech.speakEncouragement(`${dayData.closing.message}. ${dayData.closing.encouragement}`);
        break;
    }

    el.lessonPhaseCard.innerHTML = `
      <div class="phase-header">
        <div class="phase-title-group">
          <span style="font-size: 1.2rem;">${phase.emoji}</span>
          <h3>${phase.name}</h3>
        </div>
        <span class="phase-badge">${phase.suggestedMinutes} دقائق</span>
      </div>
      <div class="phase-content">
        ${contentHtml}
      </div>
    `;

    // Connect PDF button inside the rendered phase
    if (phase.id === 'main') {
      const pdfBtn = document.getElementById('download-printable-btn');
      if (pdfBtn) {
        pdfBtn.onclick = () => {
          Printable.generateDaySheet(dayData);
        };
      }
    }
  }

  // Completing the lesson
  function finishLesson(dayNumber) {
    Timer.stop();
    
    // Complete day in storage
    Storage.completeDay(dayNumber);

    // Check achievements
    const newBadges = Achievements.checkAndAward();

    if (newBadges.length > 0) {
      // Big celebration
      Confetti.celebrate();
      Speech.speakEncouragement('ما شاء الله يا مصطفى! فخورين بيك أوي! لقد حصلت على وسام جديد!');
      
      const badge = newBadges[0]; // Reveal the first unlocked badge
      showModal(`
        <div class="badge-reveal-emoji">${badge.emoji}</div>
        <h2 style="color: var(--primary); margin-top: 10px;">حصلت على وسام جديد!</h2>
        <h3 style="margin-top: 5px;">"${badge.name}"</h3>
        <p style="margin-top: 10px; color: var(--text-secondary);">${badge.description}</p>
        <button class="btn btn-primary" id="modal-ok-btn" style="margin-top: 15px; width: 100%;">شكراً! يلا نرجع للرئيسية</button>
      `);
    } else {
      // Small burst celebration
      Confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4);
      Speech.speakEncouragement('برافو عليك يا حبيبي! كملنا درس اليوم!');
      
      showModal(`
        <div style="font-size: 4rem;">🌟</div>
        <h2 style="color: var(--primary); margin-top: 10px;">شاطر أوي يا مصطفى!</h2>
        <p style="margin-top: 10px; color: var(--text-secondary);">لقد أكملت أنشطة اليوم بنجاح يا بطل! استعد لدرس بكره.</p>
        <button class="btn btn-primary" id="modal-ok-btn" style="margin-top: 15px; width: 100%;">حاضر يا ماما!</button>
      `);
    }

    const okBtn = document.getElementById('modal-ok-btn');
    if (okBtn) {
      okBtn.onclick = () => {
        closeModal();
        window.location.hash = '#/dashboard';
      };
    }
  }

  // Render Activities list
  function renderActivitiesList() {
    el.filterTabs.innerHTML = '';
    
    const categories = [
      { id: 'all', name: 'الكل' },
      { id: 'letters', name: '🔤 حروف' },
      { id: 'numbers', name: '🔢 أرقام' },
      { id: 'colors', name: '🎨 ألوان' },
      { id: 'motor', name: '✋ حركة' },
      { id: 'sensory', name: '👃 حواس' },
      { id: 'social', name: '🤝 اجتماعي' }
    ];

    let currentFilter = 'all';

    function renderFiltered(filterId) {
      currentFilter = filterId;
      
      // Update filter tabs UI
      const tabs = el.filterTabs.children;
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].dataset.filter === filterId) {
          tabs[i].classList.add('active');
        } else {
          tabs[i].classList.remove('active');
        }
      }

      el.activitiesGrid.innerHTML = '';
      
      const filtered = currentFilter === 'all' 
        ? ActivitiesData 
        : ActivitiesData.filter(act => act.category === currentFilter);

      filtered.forEach(act => {
        const card = document.createElement('div');
        card.className = 'card activity-card';
        card.innerHTML = `
          <div>
            <div class="activity-header">
              <span class="activity-emoji">${act.emoji}</span>
              <span class="activity-badge">${act.duration}</span>
            </div>
            <h3 style="font-size: 1rem; font-weight:700;">${act.title}</h3>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; line-height:1.4;">${act.educationalGoal}</p>
          </div>
          <div class="activity-details-meta">
            <span>📍 ${act.location === 'home' ? 'في البيت' : 'خارج البيت'}</span>
            <span>🛠️ ${act.materialType === 'available' ? 'أدوات بسيطة' : 'شراء بسيط'}</span>
          </div>
        `;
        
        card.onclick = () => {
          window.location.hash = `#/activity/${act.id}`;
        };
        
        el.activitiesGrid.appendChild(card);
      });
    }

    // Render filter buttons
    categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `filter-tab-btn ${cat.id === currentFilter ? 'active' : ''}`;
      tab.dataset.filter = cat.id;
      tab.textContent = cat.name;
      tab.onclick = () => renderFiltered(cat.id);
      el.filterTabs.appendChild(tab);
    });

    // Initial render
    renderFiltered('all');
  }

  // Render single activity detail
  function renderActivityDetail(activityId) {
    const act = ActivitiesData.find(a => a.id === activityId);
    if (!act) {
      window.location.hash = '#/activities';
      return;
    }

    let stepsHtml = '';
    act.steps.forEach((step, index) => {
      stepsHtml += `<li data-step="${index + 1}">${step}</li>`;
    });

    let matsHtml = '';
    act.materials.forEach(mat => {
      matsHtml += `<span style="background-color: var(--bg-surface-alt); padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.85rem;">${mat}</span>`;
    });

    el.activityDetailContent.innerHTML = `
      <div class="card activity-detail-card" style="display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size: 3.5rem;">${act.emoji}</span>
          <div>
            <h2 style="color: var(--primary);">${act.title}</h2>
            <span class="phase-badge">${act.duration}</span>
          </div>
        </div>

        <div>
          <h3 style="font-size:0.95rem; color: var(--text-secondary);">🎯 الهدف التعليمي:</h3>
          <p style="font-size:1.05rem; font-weight:700; margin-top:4px; color: var(--text-primary);">${act.educationalGoal}</p>
        </div>

        <div>
          <h3 style="font-size:0.95rem; color: var(--text-secondary); margin-bottom: 8px;">🛠️ الأدوات والمواد المطلوبة:</h3>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${matsHtml}
          </div>
        </div>

        <div>
          <h3 style="font-size:0.95rem; color: var(--text-secondary);">📝 خطوات النشاط:</h3>
          <ol class="steps-list">
            ${stepsHtml}
          </ol>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:0.85rem; color: var(--text-secondary); border-top: 1px dashed var(--border-color); padding-top:14px; margin-top:10px;">
          <span>📍 المكان: ${act.location === 'home' ? 'في المنزل' : 'خارج المنزل'}</span>
          <span>👦 السن المناسب: ${act.ageRange} سنوات</span>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:10px;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.location.hash = '#/activities'">➔ رجوع للمكتبة</button>
        <button class="btn btn-primary tts-speak" style="flex:1.5;" data-tts="النشاط: ${act.title}. الهدف: ${act.educationalGoal}. الأدوات: ${act.materials.join(' و ')}">🔊 اسمع التعليمات</button>
      </div>
    `;
  }

  // Render Achievements tab view
  function renderAchievements() {
    const stats = Achievements.getStats();
    el.achBadgeCount.textContent = `${stats.earned} / ${stats.total}`;
    
    // SVG circular progress percentage check
    const circle = el.achProgressRing.querySelector('.progress-ring-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - ((stats.earned / stats.total) * circumference);
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    
    el.achProgressRing.querySelector('.progress-val').textContent = `${stats.percentage}%`;

    // Render Badges grid
    el.achBadgesGrid.innerHTML = '';
    const allBadges = Achievements.getAllBadges();
    const earned = Storage.getAchievements();

    allBadges.forEach(badge => {
      const isEarned = earned.includes(badge.id);
      const card = document.createElement('div');
      card.className = `badge-card ${isEarned ? '' : 'locked'}`;
      card.innerHTML = `
        <span class="badge-emoji">${badge.emoji}</span>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-desc">${badge.description}</span>
      `;
      
      card.onclick = () => {
        showModal(`
          <div style="font-size: 4rem;">${badge.emoji}</div>
          <h2 style="color: var(--primary); margin-top: 10px;">${badge.name}</h2>
          <p style="margin-top: 5px; color: var(--text-secondary);">${badge.description}</p>
          <span style="font-size: 0.85rem; padding: 4px 10px; border-radius: 99px; background-color: var(--bg-surface-alt); margin-top:10px; display:inline-block;">
            ${isEarned ? '✅ تم الحصول عليه' : '🔒 معلق'}
          </span>
          <button class="btn btn-secondary" onclick="closeModal()" style="margin-top: 15px;">حسناً</button>
        `);
      };
      
      el.achBadgesGrid.appendChild(card);
    });

    // Render Certificate link if student graduated (day 28+)
    const isGraduate = earned.includes('graduate');
    if (isGraduate) {
      el.achGraduationSection.style.display = 'block';
      const certData = Achievements.generateCertificate();
      
      el.achGraduationSection.innerHTML = `
        <div class="card hero-card" style="text-align: center; border-color: var(--success); background-color: var(--success-light);">
          <div style="font-size: 3rem;">🎓</div>
          <h2 style="color: var(--success); margin-top: 8px;">تهانينا الحارة يا بطل!</h2>
          <p style="margin-top: 4px; color: var(--text-primary); font-weight:700;">لقد تخرجت رسمياً من رحلة مصطفى!</p>
          <button id="download-cert-btn" class="btn btn-success" style="margin-top: 15px; width: 100%;">
            📜 تحميل شهادة التخرج الرسمية (PDF)
          </button>
        </div>
      `;
      
      document.getElementById('download-cert-btn').onclick = () => {
        Printable.generateCertificate(certData);
      };
    } else {
      el.achGraduationSection.style.display = 'none';
    }
  }

  // Render Settings profiles management and toggle buttons
  function renderSettings() {
    const currentProfile = Storage.getActiveProfile();
    const allProfiles = Storage.getAllProfiles();
    
    el.settingsProfilesList.innerHTML = '';
    
    allProfiles.forEach(prof => {
      const row = document.createElement('div');
      row.className = `profile-row ${prof.id === currentProfile.id ? 'active' : ''}`;
      
      const completedCount = prof.progress.completedDays.length;
      row.innerHTML = `
        <div class="profile-row-info">
          <span class="profile-row-emoji">${prof.emoji}</span>
          <div class="profile-row-details">
            <span style="font-weight: 700;">${prof.name}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">مكتمل: ${completedCount}/30 يوم | 🔥 ${prof.progress.streak} يوم</span>
          </div>
        </div>
        ${allProfiles.length > 1 ? `<button class="profile-delete-btn" data-id="${prof.id}">🗑️</button>` : ''}
      `;
      
      // Click on row (excluding delete) switches active profile
      row.onclick = (e) => {
        if (e.target.classList.contains('profile-delete-btn')) return;
        Storage.switchProfile(prof.id);
        renderSettings();
        // Speak switch greeting
        Speech.speakEncouragement(`أهلاً بيك يا ${prof.name}! يلا نتعلم سوا!`);
      };

      // Delete profile handler
      const deleteBtn = row.querySelector('.profile-delete-btn');
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`هل أنت متأكد من حذف الملف الشخصي "${prof.name}"؟ ستمحى كل الإنجازات والأيام المكتملة!`)) {
            Storage.deleteProfile(prof.id);
            renderSettings();
          }
        };
      }
      
      el.settingsProfilesList.appendChild(row);
    });

    // Manage profile form visibility (max 2 profiles)
    if (Storage.canAddProfile()) {
      el.settingsProfileForm.style.display = 'flex';
      // Setup settings form emoji selector selection
      el.settingsEmojiBtns.forEach(b => b.classList.remove('selected'));
      el.settingsEmojiBtns[0].classList.add('selected');
      el.settingsProfileEmoji = '👦';
    } else {
      el.settingsProfileForm.style.display = 'none';
    }
  }

  // --- Modal Helpers ---
  function showModal(html) {
    el.modalContent.innerHTML = `
      <button class="modal-close" onclick="closeModal()">×</button>
      ${html}
    `;
    el.modalOverlay.classList.add('active');
  }

  function closeModal() {
    el.modalOverlay.classList.remove('active');
  }

  // Set closeModal as window global for simple inline onclicks
  window.closeModal = closeModal;

  return { init };
})();

// Initialize App on load
document.addEventListener('DOMContentLoaded', App.init);
