// ============================================
// achievements.js — Badge / Gamification System
// رحلة مصطفى — Mostafa's Journey
// ============================================

const Achievements = (() => {
  // All available achievements
  const BADGES = [
    {
      id: 'first_letter',
      name: 'أول حرف',
      description: 'أتعلمت أول حرف عربي!',
      emoji: '🅰️',
      category: 'letters',
      condition: (progress) => progress.completedDays.length >= 1
    },
    {
      id: 'five_letters',
      name: '٥ حروف',
      description: 'ما شاء الله! اتعلمت ٥ حروف',
      emoji: '✨',
      category: 'letters',
      condition: (progress) => progress.completedDays.length >= 5
    },
    {
      id: 'ten_letters',
      name: '١٠ حروف',
      description: 'واو! ١٠ حروف يا بطل',
      emoji: '🌟',
      category: 'letters',
      condition: (progress) => progress.completedDays.length >= 10
    },
    {
      id: 'first_number',
      name: 'أول رقم',
      description: 'اتعلمت أول رقم!',
      emoji: '🔢',
      category: 'numbers',
      condition: (progress) => progress.completedDays.length >= 1
    },
    {
      id: 'count_to_five',
      name: 'بعد لـ ٥',
      description: 'بتعرف تعد لحد ٥!',
      emoji: '🖐️',
      category: 'numbers',
      condition: (progress) => progress.completedDays.length >= 5
    },
    {
      id: 'count_to_ten',
      name: 'بعد لـ ١٠',
      description: 'بتعرف تعد لحد ١٠ يا شاطر!',
      emoji: '🔟',
      category: 'numbers',
      condition: (progress) => progress.completedDays.length >= 10
    },
    {
      id: 'color_master',
      name: 'ملك الألوان',
      description: 'اتعرفت على كل الألوان!',
      emoji: '🌈',
      category: 'colors',
      condition: (progress) => progress.completedDays.length >= 10
    },
    {
      id: 'animal_friend',
      name: 'صديق الحيوانات',
      description: 'اتعرفت على ١٠ حيوانات!',
      emoji: '🦁',
      category: 'animals',
      condition: (progress) => progress.completedDays.length >= 10
    },
    {
      id: 'quran_start',
      name: 'حافظ صغير',
      description: 'بدأت حفظ القرآن!',
      emoji: '📖',
      category: 'quran',
      condition: (progress) => progress.completedDays.length >= 1
    },
    {
      id: 'quran_fatiha',
      name: 'سورة الفاتحة',
      description: 'حفظت سورة الفاتحة!',
      emoji: '🕌',
      category: 'quran',
      condition: (progress) => progress.completedDays.filter(d => d <= 3).length >= 3
    },
    {
      id: 'streak_3',
      name: '٣ أيام متواصلين',
      description: 'ما شاء الله! ٣ أيام ورا بعض',
      emoji: '🔥',
      category: 'streak',
      condition: (progress) => progress.streak >= 3
    },
    {
      id: 'streak_7',
      name: 'أسبوع كامل',
      description: 'أسبوع كامل من التعلم!',
      emoji: '⭐',
      category: 'streak',
      condition: (progress) => progress.streak >= 7
    },
    {
      id: 'streak_14',
      name: 'أسبوعين',
      description: 'أسبوعين متواصلين يا بطل!',
      emoji: '🏆',
      category: 'streak',
      condition: (progress) => progress.streak >= 14
    },
    {
      id: 'halfway',
      name: 'نص الطريق',
      description: 'وصلت لنص الرحلة!',
      emoji: '🎯',
      category: 'milestone',
      condition: (progress) => progress.completedDays.length >= 15
    },
    {
      id: 'graduate',
      name: 'خريج رحلة مصطفى',
      description: 'خلصت الرحلة كلها! مبروك يا حبيبي!',
      emoji: '🎓',
      category: 'milestone',
      condition: (progress) => progress.completedDays.length >= 28
    }
  ];

  function getAllBadges() {
    return BADGES;
  }

  function getBadge(id) {
    return BADGES.find(b => b.id === id) || null;
  }

  function getUnlockedBadges() {
    const earned = Storage.getAchievements();
    return BADGES.filter(b => earned.includes(b.id));
  }

  function getLockedBadges() {
    const earned = Storage.getAchievements();
    return BADGES.filter(b => !earned.includes(b.id));
  }

  // Check for new achievements after a day is completed
  // Returns an array of newly unlocked badges
  function checkAndAward() {
    const progress = Storage.getProgress();
    const newBadges = [];

    BADGES.forEach(badge => {
      if (!progress.achievements.includes(badge.id)) {
        if (badge.condition(progress)) {
          const isNew = Storage.addAchievement(badge.id);
          if (isNew) {
            newBadges.push(badge);
          }
        }
      }
    });

    return newBadges;
  }

  // Get progress towards next unearned badge
  function getNextBadgeHint() {
    const progress = Storage.getProgress();
    const earned = progress.achievements;

    // Find first unearned badge
    for (const badge of BADGES) {
      if (!earned.includes(badge.id)) {
        return badge;
      }
    }
    return null; // All earned
  }

  // Get achievement stats
  function getStats() {
    const earned = Storage.getAchievements();
    return {
      total: BADGES.length,
      earned: earned.length,
      percentage: Math.round((earned.length / BADGES.length) * 100)
    };
  }

  // Generate graduation certificate data
  function generateCertificate() {
    const profile = Storage.getActiveProfile();
    if (!profile) return null;

    return {
      name: profile.name,
      emoji: profile.emoji,
      completedDays: profile.progress.completedDays.length,
      totalDays: 30,
      date: new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      achievements: Storage.getAchievements().length,
      totalAchievements: BADGES.length
    };
  }

  return {
    getAllBadges,
    getBadge,
    getUnlockedBadges,
    getLockedBadges,
    checkAndAward,
    getNextBadgeHint,
    getStats,
    generateCertificate
  };
})();
