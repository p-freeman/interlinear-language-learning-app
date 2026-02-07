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

export default function ImportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleLoadSample = async () => {
    console.log('handleLoadSample called');
    setLoading(true);
    setStatus('Installing sample content...');
    try {
      console.log('Calling installSampleContent...');
      const success = await installSampleContent();
      console.log('installSampleContent result:', success);
      if (success) {
        if (Platform.OS === 'web') {
          window.alert('Sample content installed successfully!');
          router.back();
        } else {
          Alert.alert('Success', 'Sample content installed successfully!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('Failed to install sample content.');
        } else {
          Alert.alert('Error', 'Failed to install sample content.');
        }
      }
    } catch (error) {
      console.error('Error loading sample:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to install sample content: ' + (error as Error).message);
      } else {
        Alert.alert('Error', 'Failed to install sample content: ' + (error as Error).message);
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setLoading(true);
      setStatus('Reading ZIP file...');

      const success = await importZipFromUri(file.uri, file.name);
      
      if (success) {
        Alert.alert('Success', 'Content imported successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to import content. Please check the ZIP file format.');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleUrlImport = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!url.toLowerCase().endsWith('.zip')) {
      Alert.alert('Error', 'URL must point to a ZIP file');
      return;
    }

    setLoading(true);
    setStatus('Downloading ZIP file...');

    try {
      const success = await importZipFromUrl(url.trim());
      
      if (success) {
        Alert.alert('Success', 'Content imported successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        setUrl('');
      } else {
        Alert.alert('Error', 'Failed to import content. Please check the URL and ZIP file format.');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Error', 'Failed to download: ' + (error as Error).message);
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-open" size={24} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Import from Device</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select a ZIP file from your device containing language learning content.
          </Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleFilePick}
            disabled={loading}
          >
            <Ionicons name="document" size={20} color="#fff" />
            <Text style={styles.buttonText}>Choose ZIP File</Text>
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
            <Text style={styles.sectionTitle}>Import from URL</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Enter a direct link to a ZIP file to download and import.
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
            <Text style={styles.buttonText}>Download & Import</Text>
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
            <Text style={styles.sectionTitle}>Try Sample Content</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Load a sample Swiss German lesson to see how the app works.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.sampleButton, loading && styles.buttonDisabled]}
            onPress={handleLoadSample}
            disabled={loading}
          >
            <Ionicons name="rocket" size={20} color="#fff" />
            <Text style={styles.buttonText}>Load Sample Content</Text>
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
