import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { importZipFromUri, importZipFromUrl } from '../src/utils/zipHandler';
import { installSampleContent } from '../src/utils/sampleContent';
import { useSettings } from '../src/contexts/SettingsContext';
import { translations } from '../src/i18n/translations';

export default function ImportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = useSettings();
  const t = translations[settings.appLanguage];
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleLoadSample = async () => {
    console.log('handleLoadSample called');
    setLoading(true);
    setStatus(t.loading);
    try {
      console.log('Calling installSampleContent...');
      const success = await installSampleContent();
      console.log('installSampleContent result:', success);
      if (success) {
        if (Platform.OS === 'web') {
          window.alert(t.importSuccessful);
          router.back();
        } else {
          Alert.alert(t.success, t.importSuccessful, [
            { text: t.ok, onPress: () => router.back() },
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert(t.failedToImport);
        } else {
          Alert.alert(t.error, t.failedToImport);
        }
      }
    } catch (error) {
      console.error('Error loading sample:', error);
      if (Platform.OS === 'web') {
        window.alert(t.failedToImport + ': ' + (error as Error).message);
      } else {
        Alert.alert(t.error, t.failedToImport + ': ' + (error as Error).message);
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      console.log('File selected:', file);
      setLoading(true);
      setStatus(t.loading);

      const importResult = await importZipFromUri(file.uri, file.name || 'import.zip');
      
      if (importResult.success) {
        Alert.alert(t.success, t.importSuccessful, [
          { text: t.ok, onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t.error, importResult.error || t.invalidZipFormat);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert(t.error, t.failedToImport + ': ' + (error as Error).message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleUrlImport = async () => {
    if (!url.trim()) {
      Alert.alert(t.error, 'Please enter a URL');
      return;
    }

    if (!url.toLowerCase().endsWith('.zip')) {
      Alert.alert(t.error, 'URL must point to a ZIP file');
      return;
    }

    setLoading(true);
    setStatus(t.loading);

    try {
      const importResult = await importZipFromUrl(url.trim());
      
      if (importResult.success) {
        Alert.alert(t.success, t.importSuccessful, [
          { text: t.ok, onPress: () => router.back() },
        ]);
        setUrl('');
      } else {
        Alert.alert(t.error, importResult.error || t.invalidZipFormat);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert(t.error, t.failedToImport + ': ' + (error as Error).message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Create New Project Button */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create" size={24} color="#00b894" />
            <Text style={styles.sectionTitle}>{t.createNewProject}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t.createNewProjectDesc}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={() => router.push('/create-project')}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t.createNewProject}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-open" size={24} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>{t.importFromDevice}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t.importFromDeviceDesc}
          </Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleFilePick}
            disabled={loading}
          >
            <Ionicons name="document" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t.chooseZipFile}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-download" size={24} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>{t.importFromUrl}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t.importFromUrlDesc}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/content.zip"
            placeholderTextColor="#4a4a6a"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, (loading || !url.trim()) && styles.buttonDisabled]}
            onPress={handleUrlImport}
            disabled={loading || !url.trim()}
          >
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t.downloadAndImport}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#00b894" />
            <Text style={styles.sectionTitle}>{t.loadSampleContent}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t.loadSampleContentDesc}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.sampleButton, loading && styles.buttonDisabled]}
            onPress={handleLoadSample}
            disabled={loading}
          >
            <Ionicons name="rocket" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t.loadSampleContent}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6c5ce7" />
            <Text style={styles.loadingText}>{status}</Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Expected ZIP Content:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="musical-note" size={16} color="#a0a0c0" />
            <Text style={styles.infoText}>audio.mp3 - Audio file</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="document-text" size={16} color="#a0a0c0" />
            <Text style={styles.infoText}>interlinear.html - Interlinear text</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="list" size={16} color="#a0a0c0" />
            <Text style={styles.infoText}>words_*.txt - Word lists (optional)</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="settings" size={16} color="#a0a0c0" />
            <Text style={styles.infoText}>project.yaml - Project metadata</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionDescription: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  createButton: {
    backgroundColor: '#00b894',
  },
  sampleButton: {
    backgroundColor: '#00b894',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a4e',
  },
  dividerText: {
    color: '#4a4a6a',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#a0a0c0',
    marginTop: 12,
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  infoText: {
    color: '#a0a0c0',
    fontSize: 14,
  },
});
