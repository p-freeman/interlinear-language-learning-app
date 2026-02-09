import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage } from '../i18n/translations';

export type FontSize = 'small' | 'medium' | 'large' | 'extraLarge';
export type TargetLanguage = 'German' | 'Swiss German';

export interface AppSettings {
  // Language Settings
  appLanguage: SupportedLanguage;
  
  // Audio Playback Settings
  playbackSpeed: number; // 0.5 - 2.0
  autoRepeatCount: number; // 0 = unlimited, or 1-100
  backgroundPlayback: boolean;
  
  // Display Settings
  fontSize: FontSize;
  
  // Learning Preferences
  defaultTargetLanguage: TargetLanguage;
  rememberLastProject: boolean;
  autoPlayAudio: boolean;
  lastProjectId: string | null;
  
  // Data & Storage
  customStorageLocation: string | null;
  
  // Advanced
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  studyStatisticsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  appLanguage: 'en',
  playbackSpeed: 1.0,
  autoRepeatCount: 0, // unlimited
  backgroundPlayback: true,
  fontSize: 'medium',
  defaultTargetLanguage: 'Swiss German',
  rememberLastProject: false,
  autoPlayAudio: false,
  lastProjectId: null,
  customStorageLocation: null,
  dailyReminderEnabled: false,
  dailyReminderTime: '09:00',
  studyStatisticsEnabled: true,
};

const SETTINGS_KEY = 'interlinear_app_settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const getFontSizeValue = (size: FontSize): number => {
  switch (size) {
    case 'small': return 14;
    case 'medium': return 18;
    case 'large': return 22;
    case 'extraLarge': return 26;
    default: return 18;
  }
};
