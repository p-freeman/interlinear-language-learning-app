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
import * as FileSystem from 'expo-file-system/legacy';
import {
  Project,
  CONTENT_DIR,
  ensureContentDirectory,
  addProject,
  generateProjectId,
} from '../src/utils/storage';
import { useSettings } from '../src/contexts/SettingsContext';
import { translations } from '../src/i18n/translations';

const TARGET_LANGUAGES = ['German', 'Swiss German'];
const NATIVE_LANGUAGES = ['English'];

export default function CreateProjectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = useSettings();
  const t = translations[settings.appLanguage];
  
  const [projectName, setProjectName] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(settings.defaultTargetLanguage);
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string } | null>(null);
  const [htmlFile, setHtmlFile] = useState<{ uri: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [showNativeDropdown, setShowNativeDropdown] = useState(false);

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setAudioFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'audio.mp3',
        });
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert(t.error, t.failedToLoad);
    }
  };

  const pickHtmlFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/html', 'text/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setHtmlFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'interlinear.html',
        });
      }
    } catch (error) {
      console.error('Error picking HTML file:', error);
      Alert.alert(t.error, t.failedToLoad);
    }
  };

  const createProject = async () => {
    // Validation
    if (!projectName.trim()) {
      Alert.alert(t.error, t.pleaseEnterProjectName);
      return;
    }

    if (!htmlFile) {
      Alert.alert(t.error, t.pleaseSelectHtmlFile);
      return;
    }

    setLoading(true);

    try {
      await ensureContentDirectory();

      const projectId = generateProjectId();
      const safeProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeSource = source.trim() ? source.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'source_undefined';
      const folderPath = `${CONTENT_DIR}${targetLanguage}/${nativeLanguage}/${safeSource}/${safeProjectName}_${projectId}/`;

      console.log('Creating project folder:', folderPath);

      // Create directory
      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });

      // Copy HTML file (rename to interlinear.html)
      const htmlContent = await FileSystem.readAsStringAsync(htmlFile.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await FileSystem.writeAsStringAsync(
        `${folderPath}interlinear.html`,
        htmlContent,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      console.log('HTML file copied');

      // Copy audio file if selected (rename to audio.mp3)
      if (audioFile) {
        const audioContent = await FileSystem.readAsStringAsync(audioFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(
          `${folderPath}audio.mp3`,
          audioContent,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        console.log('Audio file copied');
      }

      // Create project.yaml content
      const yamlContent = `project_name: ${projectName.trim()}
target_language: ${targetLanguage}
native_language: ${nativeLanguage}
author: ${author.trim() || ''}
source: ${source.trim() || ''}
description: ${description.trim() || ''}
`;

      await FileSystem.writeAsStringAsync(
        `${folderPath}project.yaml`,
        yamlContent,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      console.log('project.yaml created');

      // Create and save project to storage
      const project: Project = {
        id: projectId,
        projectName: projectName.trim(),
        targetLanguage,
        nativeLanguage,
        author: author.trim() || undefined,
        source: source.trim() || undefined,
        description: description.trim() || undefined,
        folderPath,
        createdAt: new Date().toISOString(),
      };

      await addProject(project);
      console.log('Project saved to storage');

      Alert.alert(t.success, t.projectCreated, [
        { text: t.ok, onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating project:', errorMessage, error);
      Alert.alert(t.error, `${t.failedToSave}: ${errorMessage}`);
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>{t.createNewProject}</Text>
        <Text style={styles.subtitle}>
          {t.createNewProjectDesc}
        </Text>

        {/* Project Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.projectName} *</Text>
          <TextInput
            style={styles.input}
            placeholder={t.projectName}
            placeholderTextColor="#4a4a6a"
            value={projectName}
            onChangeText={setProjectName}
          />
        </View>

        {/* Target Language Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.targetLanguage} *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTargetDropdown(!showTargetDropdown)}
          >
            <Text style={styles.dropdownText}>{targetLanguage}</Text>
            <Ionicons
              name={showTargetDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#a0a0c0"
            />
          </TouchableOpacity>
          {showTargetDropdown && (
            <View style={styles.dropdownList}>
              {TARGET_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.dropdownItem,
                    targetLanguage === lang && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setTargetLanguage(lang);
                    setShowTargetDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      targetLanguage === lang && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Native Language Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Native Language *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowNativeDropdown(!showNativeDropdown)}
          >
            <Text style={styles.dropdownText}>{nativeLanguage}</Text>
            <Ionicons
              name={showNativeDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#a0a0c0"
            />
          </TouchableOpacity>
          {showNativeDropdown && (
            <View style={styles.dropdownList}>
              {NATIVE_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.dropdownItem,
                    nativeLanguage === lang && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setNativeLanguage(lang);
                    setShowNativeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      nativeLanguage === lang && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Author (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Author (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter author name"
            placeholderTextColor="#4a4a6a"
            value={author}
            onChangeText={setAuthor}
          />
        </View>

        {/* Source (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Source (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter source"
            placeholderTextColor="#4a4a6a"
            value={source}
            onChangeText={setSource}
          />
        </View>

        {/* Description (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            placeholderTextColor="#4a4a6a"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* File Pickers */}
        <View style={styles.fileSection}>
          <Text style={styles.sectionTitle}>Project Files</Text>

          {/* Audio File Picker */}
          <View style={styles.filePicker}>
            <View style={styles.fileInfo}>
              <Ionicons name="musical-note" size={24} color="#6c5ce7" />
              <View style={styles.fileDetails}>
                <Text style={styles.fileLabel}>Audio File (Optional)</Text>
                <Text style={styles.fileName}>
                  {audioFile ? audioFile.name : 'No file selected'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.fileButton} onPress={pickAudioFile}>
              <Ionicons name="folder-open" size={18} color="#fff" />
              <Text style={styles.fileButtonText}>Browse</Text>
            </TouchableOpacity>
          </View>

          {/* HTML File Picker */}
          <View style={styles.filePicker}>
            <View style={styles.fileInfo}>
              <Ionicons name="document-text" size={24} color="#6c5ce7" />
              <View style={styles.fileDetails}>
                <Text style={styles.fileLabel}>Interlinear HTML File *</Text>
                <Text style={styles.fileName}>
                  {htmlFile ? htmlFile.name : 'No file selected'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.fileButton} onPress={pickHtmlFile}>
              <Ionicons name="folder-open" size={18} color="#fff" />
              <Text style={styles.fileButtonText}>Browse</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={createProject}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="create" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Create Project</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.requiredNote}>* Required fields</Text>
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
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  dropdownItemSelected: {
    backgroundColor: '#2a2a4e',
  },
  dropdownItemText: {
    color: '#a0a0c0',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
  fileSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filePicker: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fileName: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 2,
  },
  fileButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#00b894',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  requiredNote: {
    color: '#4a4a6a',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
