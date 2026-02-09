import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import Slider from '@react-native-community/slider';
import { useSettings, FontSize, TargetLanguage } from '../src/contexts/SettingsContext';
import { translations, SupportedLanguage, LANGUAGE_NAMES } from '../src/i18n/translations';
import { clearStatistics, exportStatisticsAsText } from '../src/utils/statistics';

const FONT_SIZES: FontSize[] = ['small', 'medium', 'large', 'extraLarge'];
const TARGET_LANGUAGES: TargetLanguage[] = ['German', 'Swiss German'];
const APP_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'pt', 'ru', 'uk', 'tr', 'ku'];
const REPEAT_OPTIONS = [0, 5, 10, 20, 50, 100]; // 0 = unlimited

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings, isLoading } = useSettings();
  const t = translations[settings.appLanguage];
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTargetLangModal, setShowTargetLangModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      t.clearCache,
      t.clearCacheConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.yes,
          onPress: async () => {
            try {
              const cacheDir = FileSystem.cacheDirectory;
              if (cacheDir) {
                const files = await FileSystem.readDirectoryAsync(cacheDir);
                for (const file of files) {
                  await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
                }
              }
              Alert.alert(t.success, t.cacheCleared);
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert(t.error, t.failedToSave);
            }
          },
        },
      ]
    );
  };

  const handleExportStatistics = async () => {
    setExporting(true);
    try {
      const result = await exportStatisticsAsText();
      if (result.success) {
        // Share dialog will open
      } else {
        Alert.alert(t.error, result.error || t.failedToExport);
      }
    } catch (error) {
      Alert.alert(t.error, t.failedToExport);
    } finally {
      setExporting(false);
    }
  };

  const getFontSizeLabel = (size: FontSize): string => {
    switch (size) {
      case 'small': return t.small;
      case 'medium': return t.medium;
      case 'large': return t.large;
      case 'extraLarge': return t.extraLarge;
    }
  };

  const getRepeatLabel = (count: number): string => {
    if (count === 0) return t.unlimited;
    return `${count} ${t.times}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.languageSettings}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.appLanguage}</Text>
                <Text style={styles.settingDesc}>{t.appLanguageDesc}</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.valueText}>{LANGUAGE_NAMES[settings.appLanguage]}</Text>
              <Ionicons name="chevron-forward" size={20} color="#4a4a6a" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Audio Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.audioPlaybackSettings}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="speedometer" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.playbackSpeed}</Text>
                <Text style={styles.settingDesc}>{t.playbackSpeedDesc}</Text>
              </View>
            </View>
            <Text style={styles.valueText}>{settings.playbackSpeed.toFixed(1)}x</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            value={settings.playbackSpeed}
            onSlidingComplete={(value) => updateSettings({ playbackSpeed: value })}
            minimumTrackTintColor="#6c5ce7"
            maximumTrackTintColor="#2a2a4e"
            thumbTintColor="#6c5ce7"
          />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowRepeatModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="repeat" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.autoRepeatCount}</Text>
                <Text style={styles.settingDesc}>{t.autoRepeatCountDesc}</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.valueText}>{getRepeatLabel(settings.autoRepeatCount)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#4a4a6a" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="play-circle" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.backgroundPlayback}</Text>
                <Text style={styles.settingDesc}>{t.backgroundPlaybackDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.backgroundPlayback}
              onValueChange={(value) => updateSettings({ backgroundPlayback: value })}
              trackColor={{ false: '#2a2a4e', true: '#6c5ce7' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.displaySettings}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowFontSizeModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="text" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.fontSize}</Text>
                <Text style={styles.settingDesc}>{t.fontSizeDesc}</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.valueText}>{getFontSizeLabel(settings.fontSize)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#4a4a6a" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Learning Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.learningPreferences}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowTargetLangModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="flag" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.defaultTargetLanguage}</Text>
                <Text style={styles.settingDesc}>{t.defaultTargetLanguageDesc}</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.valueText}>{settings.defaultTargetLanguage}</Text>
              <Ionicons name="chevron-forward" size={20} color="#4a4a6a" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="bookmark" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.rememberLastProject}</Text>
                <Text style={styles.settingDesc}>{t.rememberLastProjectDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.rememberLastProject}
              onValueChange={(value) => updateSettings({ rememberLastProject: value })}
              trackColor={{ false: '#2a2a4e', true: '#6c5ce7' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="play" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.autoPlayAudio}</Text>
                <Text style={styles.settingDesc}>{t.autoPlayAudioDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.autoPlayAudio}
              onValueChange={(value) => updateSettings({ autoPlayAudio: value })}
              trackColor={{ false: '#2a2a4e', true: '#6c5ce7' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.dataStorageSettings}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="folder" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.storageLocation}</Text>
                <Text style={styles.settingDesc}>{t.storageLocationDesc}</Text>
              </View>
            </View>
            <Text style={styles.valueTextSmall} numberOfLines={1}>
              {settings.customStorageLocation || 'Default'}
            </Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>{t.clearCache}</Text>
          </TouchableOpacity>
          <Text style={styles.actionDesc}>{t.clearCacheDesc}</Text>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert(t.exportAllProjects, 'This feature will export all your projects as a backup file. Coming soon!')}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#00b894" />
            <Text style={[styles.actionButtonText, { color: '#00b894' }]}>{t.exportAllProjects}</Text>
          </TouchableOpacity>
          <Text style={styles.actionDesc}>{t.exportAllProjectsDesc}</Text>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.advancedSettings}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.dailyReminder}</Text>
                <Text style={styles.settingDesc}>{t.dailyReminderDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(value) => updateSettings({ dailyReminderEnabled: value })}
              trackColor={{ false: '#2a2a4e', true: '#6c5ce7' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="stats-chart" size={22} color="#6c5ce7" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t.studyStatistics}</Text>
                <Text style={styles.settingDesc}>{t.studyStatisticsDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.studyStatisticsEnabled}
              onValueChange={(value) => updateSettings({ studyStatisticsEnabled: value })}
              trackColor={{ false: '#2a2a4e', true: '#6c5ce7' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/statistics')}
          >
            <Ionicons name="bar-chart-outline" size={20} color="#6c5ce7" />
            <Text style={styles.actionButtonText}>{t.viewStatistics}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleExportStatistics}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#6c5ce7" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#6c5ce7" />
            )}
            <Text style={styles.actionButtonText}>{t.exportStatistics}</Text>
          </TouchableOpacity>
        </View>

        {/* Help Button */}
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => router.push('/help')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
          <Text style={styles.helpButtonText}>{t.help}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalCancel}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t.appLanguage}</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {APP_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.modalOption,
                  settings.appLanguage === lang && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ appLanguage: lang });
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  settings.appLanguage === lang && styles.modalOptionTextSelected,
                ]}>
                  {LANGUAGE_NAMES[lang]}
                </Text>
                {settings.appLanguage === lang && (
                  <Ionicons name="checkmark" size={24} color="#6c5ce7" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Target Language Modal */}
      <Modal
        visible={showTargetLangModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTargetLangModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTargetLangModal(false)}>
              <Text style={styles.modalCancel}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t.defaultTargetLanguage}</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {TARGET_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.modalOption,
                  settings.defaultTargetLanguage === lang && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ defaultTargetLanguage: lang });
                  setShowTargetLangModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  settings.defaultTargetLanguage === lang && styles.modalOptionTextSelected,
                ]}>
                  {lang}
                </Text>
                {settings.defaultTargetLanguage === lang && (
                  <Ionicons name="checkmark" size={24} color="#6c5ce7" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Font Size Modal */}
      <Modal
        visible={showFontSizeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFontSizeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFontSizeModal(false)}>
              <Text style={styles.modalCancel}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t.fontSize}</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {FONT_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.modalOption,
                  settings.fontSize === size && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ fontSize: size });
                  setShowFontSizeModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  settings.fontSize === size && styles.modalOptionTextSelected,
                ]}>
                  {getFontSizeLabel(size)}
                </Text>
                {settings.fontSize === size && (
                  <Ionicons name="checkmark" size={24} color="#6c5ce7" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Repeat Count Modal */}
      <Modal
        visible={showRepeatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRepeatModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
              <Text style={styles.modalCancel}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t.autoRepeatCount}</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {REPEAT_OPTIONS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.modalOption,
                  settings.autoRepeatCount === count && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ autoRepeatCount: count });
                  setShowRepeatModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  settings.autoRepeatCount === count && styles.modalOptionTextSelected,
                ]}>
                  {getRepeatLabel(count)}
                </Text>
                {settings.autoRepeatCount === count && (
                  <Ionicons name="checkmark" size={24} color="#6c5ce7" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
  },
  settingDesc: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '500',
  },
  valueTextSmall: {
    color: '#a0a0c0',
    fontSize: 12,
    maxWidth: 100,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    marginTop: 12,
  },
  actionButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: '500',
  },
  actionDesc: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    marginTop: 8,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancel: {
    color: '#6c5ce7',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#2a2a4e',
  },
  modalOptionText: {
    color: '#a0a0c0',
    fontSize: 16,
  },
  modalOptionTextSelected: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
});
