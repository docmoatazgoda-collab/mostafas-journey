// ============================================
// storage.js — LocalStorage Abstraction Layer
// رحلة مصطفى — Mostafa's Journey
// ============================================

const Storage = (() => {
  const STORAGE_KEY = 'mostafa_journey_data';

  // Default data structure
  const defaultData = () => ({
    profiles: [],
    activeProfileId: null,
    settings: {
      theme: 'light',
      speechEnabled: true
    }
  });

  // Generate a simple UUID
  function generateId() {
    return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get today's date as YYYY-MM-DD
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Get yesterday's date as YYYY-MM-DD
  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Load all data from localStorage
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      // Merge with defaults to handle schema updates
      return { ...defaultData(), ...parsed };
    } catch (e) {
      console.error('Storage load error:', e);
      return defaultData();
    }
  }

  // Save all data to localStorage
  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // ---- Profile Methods ----

  function createProfile(name, emoji = '👦', age = 3) {
    const data = loadData();
    const profile = {
      id: generateId(),
      name: name,
      emoji: emoji,
      age: age,
      createdAt: new Date().toISOString(),
      progress: {
        currentDay: 1,
        completedDays: [],
        streak: 0,
        lastCompletedDate: null,
        achievements: []
      }
    };
    data.profiles.push(profile);
    data.activeProfileId = profile.id;
    saveData(data);
    return profile;
  }

  function getActiveProfile() {
    const data = loadData();
    if (!data.activeProfileId || data.profiles.length === 0) return null;
    return data.profiles.find(p => p.id === data.activeProfileId) || null;
  }

  function getActiveProfileId() {
    const data = loadData();
    return data.activeProfileId;
  }

  function getAllProfiles() {
    const data = loadData();
    return data.profiles || [];
  }

  function switchProfile(profileId) {
    const data = loadData();
    const profile = data.profiles.find(p => p.id === profileId);
    if (profile) {
      data.activeProfileId = profileId;
      saveData(data);
      return profile;
    }
    return null;
  }

  function updateProfile(profileId, updates) {
    const data = loadData();
    const idx = data.profiles.findIndex(p => p.id === profileId);
    if (idx !== -1) {
      data.profiles[idx] = { ...data.profiles[idx], ...updates };
      saveData(data);
      return data.profiles[idx];
    }
    return null;
  }

  function deleteProfile(profileId) {
    const data = loadData();
    data.profiles = data.profiles.filter(p => p.id !== profileId);
    if (data.activeProfileId === profileId) {
      data.activeProfileId = data.profiles.length > 0 ? data.profiles[0].id : null;
    }
    saveData(data);
  }

  // ---- Progress Methods ----

  function completeDay(dayNumber) {
    const data = loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (!profile) return null;

    // Add to completed days if not already
    if (!profile.progress.completedDays.includes(dayNumber)) {
      profile.progress.completedDays.push(dayNumber);
      profile.progress.completedDays.sort((a, b) => a - b);
    }

    // Update current day
    if (dayNumber >= profile.progress.currentDay) {
      profile.progress.currentDay = Math.min(dayNumber + 1, 30);
    }

    // Update streak
    const today = todayStr();
    const yesterday = yesterdayStr();
    const lastDate = profile.progress.lastCompletedDate;

    if (lastDate === today) {
      // Already completed today, no change
    } else if (lastDate === yesterday) {
      // Consecutive day
      profile.progress.streak += 1;
    } else {
      // Gap or first completion
      profile.progress.streak = 1;
    }
    profile.progress.lastCompletedDate = today;

    saveData(data);
    return profile.progress;
  }

  function getProgress() {
    const profile = getActiveProfile();
    if (!profile) return { currentDay: 1, completedDays: [], streak: 0, achievements: [] };
    
    // Check if streak is still valid
    const today = todayStr();
    const yesterday = yesterdayStr();
    const lastDate = profile.progress.lastCompletedDate;
    
    if (lastDate && lastDate !== today && lastDate !== yesterday) {
      // Streak broken
      const data = loadData();
      const idx = data.profiles.findIndex(p => p.id === data.activeProfileId);
      if (idx !== -1) {
        data.profiles[idx].progress.streak = 0;
        saveData(data);
        return data.profiles[idx].progress;
      }
    }
    
    return profile.progress;
  }

  function getCurrentDay() {
    const progress = getProgress();
    return progress.currentDay;
  }

  function isDayCompleted(dayNumber) {
    const progress = getProgress();
    return progress.completedDays.includes(dayNumber);
  }

  function getStreak() {
    const progress = getProgress();
    return progress.streak;
  }

  // ---- Achievement Methods ----

  function addAchievement(achievementId) {
    const data = loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (!profile) return false;

    if (!profile.progress.achievements.includes(achievementId)) {
      profile.progress.achievements.push(achievementId);
      saveData(data);
      return true; // New achievement
    }
    return false; // Already had it
  }

  function hasAchievement(achievementId) {
    const progress = getProgress();
    return progress.achievements.includes(achievementId);
  }

  function getAchievements() {
    const progress = getProgress();
    return progress.achievements || [];
  }

  // ---- Settings Methods ----

  function getSettings() {
    const data = loadData();
    return data.settings || { theme: 'light', speechEnabled: true };
  }

  function updateSettings(updates) {
    const data = loadData();
    data.settings = { ...data.settings, ...updates };
    saveData(data);
    return data.settings;
  }

  function getTheme() {
    return getSettings().theme;
  }

  function setTheme(theme) {
    updateSettings({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ---- Export / Import ----

  function exportData() {
    const data = loadData();
    return JSON.stringify(data, null, 2);
  }

  function importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      // Validate structure
      if (!parsed.profiles || !Array.isArray(parsed.profiles)) {
        throw new Error('Invalid data structure');
      }
      saveData(parsed);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  // ---- Utility ----

  function hasProfiles() {
    const data = loadData();
    return data.profiles.length > 0;
  }

  function canAddProfile() {
    const data = loadData();
    return data.profiles.length < 2;
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Public API
  return {
    createProfile,
    getActiveProfile,
    getActiveProfileId,
    getAllProfiles,
    switchProfile,
    updateProfile,
    deleteProfile,
    completeDay,
    getProgress,
    getCurrentDay,
    isDayCompleted,
    getStreak,
    addAchievement,
    hasAchievement,
    getAchievements,
    getSettings,
    updateSettings,
    getTheme,
    setTheme,
    exportData,
    importData,
    hasProfiles,
    canAddProfile,
    clearAll
  };
})();
