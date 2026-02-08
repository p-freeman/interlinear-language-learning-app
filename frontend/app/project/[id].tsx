import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProject, updateProject, deleteProject, Project } from '../../src/utils/storage';
import { exportProjectToZip } from '../../src/utils/exportProject';

export default function ProjectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      const loadedProject = await getProject(id);
      if (loadedProject) {
        setProject(loadedProject);
        setEditedProject(loadedProject);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    setExporting(true);
    try {
      const result = await exportProjectToZip(project);
      if (!result.success) {
        Alert.alert('Export Failed', result.error || 'Failed to export project');
      }
    } catch (error) {
      console.error('Error exporting project:', error);
      Alert.alert('Error', 'Failed to export project: ' + (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;
    try {
      await updateProject(project.id, editedProject);
      setProject({ ...project, ...editedProject });
      setEditMode(false);
      Alert.alert('Success', 'Project updated successfully');
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project!.id);
              router.back();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Project not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="book" size={40} color="#6c5ce7" />
          </View>
          <Text style={styles.title}>{project.projectName}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="language" size={18} color="#6c5ce7" />
              <Text style={styles.labelText}>Target Language</Text>
            </View>
            <Text style={styles.infoValue}>{project.targetLanguage}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="globe" size={18} color="#6c5ce7" />
              <Text style={styles.labelText}>Native Language</Text>
            </View>
            <Text style={styles.infoValue}>{project.nativeLanguage}</Text>
          </View>

          {project.author && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="person" size={18} color="#6c5ce7" />
                <Text style={styles.labelText}>Author</Text>
              </View>
              <Text style={styles.infoValue}>{project.author}</Text>
            </View>
          )}

          {project.source && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="link" size={18} color="#6c5ce7" />
                <Text style={styles.labelText}>Source</Text>
              </View>
              <Text style={styles.infoValue}>{project.source}</Text>
            </View>
          )}

          {project.description && (
            <View style={styles.descriptionSection}>
              <View style={styles.infoLabel}>
                <Ionicons name="information-circle" size={18} color="#6c5ce7" />
                <Text style={styles.labelText}>Description</Text>
              </View>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Learning Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/interlinear/${project.id}`)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="document-text" size={24} color="#fff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Open Interlinear Text</Text>
              <Text style={styles.actionDescription}>
                View the word-by-word translation with audio
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6c5ce7" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/audio-loop/${project.id}`)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#00b894' }]}>
              <Ionicons name="repeat" size={24} color="#fff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Loop Audio</Text>
              <Text style={styles.actionDescription}>
                Play the audio file continuously on repeat
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6c5ce7" />
          </TouchableOpacity>
        </View>

        <View style={styles.manageSection}>
          <Text style={styles.sectionTitle}>Manage</Text>
          
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => setEditMode(true)}
          >
            <Ionicons name="create" size={20} color="#6c5ce7" />
            <Text style={styles.manageButtonText}>Edit Project Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.manageButton, styles.exportButton]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#00b894" />
            ) : (
              <Ionicons name="share-outline" size={20} color="#00b894" />
            )}
            <Text style={[styles.manageButtonText, styles.exportButtonText]}>
              {exporting ? 'Exporting...' : 'Export as ZIP (Share)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.manageButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#e74c3c" />
            <Text style={[styles.manageButtonText, styles.deleteButtonText]}>
              Delete Project
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editMode}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditMode(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditMode(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Project</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Project Name</Text>
            <TextInput
              style={styles.input}
              value={editedProject.projectName}
              onChangeText={(text) => setEditedProject({ ...editedProject, projectName: text })}
              placeholder="Project name"
              placeholderTextColor="#4a4a6a"
            />

            <Text style={styles.inputLabel}>Author (Optional)</Text>
            <TextInput
              style={styles.input}
              value={editedProject.author || ''}
              onChangeText={(text) => setEditedProject({ ...editedProject, author: text })}
              placeholder="Author name"
              placeholderTextColor="#4a4a6a"
            />

            <Text style={styles.inputLabel}>Source (Optional)</Text>
            <TextInput
              style={styles.input}
              value={editedProject.source || ''}
              onChangeText={(text) => setEditedProject({ ...editedProject, source: text })}
              placeholder="Source name"
              placeholderTextColor="#4a4a6a"
            />

            <Text style={styles.inputLabel}>Target Language</Text>
            <TextInput
              style={styles.input}
              value={editedProject.targetLanguage}
              onChangeText={(text) => setEditedProject({ ...editedProject, targetLanguage: text })}
              placeholder="Language to learn"
              placeholderTextColor="#4a4a6a"
            />

            <Text style={styles.inputLabel}>Native Language</Text>
            <TextInput
              style={styles.input}
              value={editedProject.nativeLanguage}
              onChangeText={(text) => setEditedProject({ ...editedProject, nativeLanguage: text })}
              placeholder="Your native language"
              placeholderTextColor="#4a4a6a"
            />

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedProject.description || ''}
              onChangeText={(text) => setEditedProject({ ...editedProject, description: text })}
              placeholder="Description"
              placeholderTextColor="#4a4a6a"
              multiline
              numberOfLines={4}
            />
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    color: '#a0a0c0',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionSection: {
    paddingTop: 12,
  },
  descriptionText: {
    color: '#a0a0c0',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  actionsSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionDescription: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 2,
  },
  manageSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  manageButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    marginBottom: 0,
  },
  deleteButtonText: {
    color: '#e74c3c',
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
    color: '#a0a0c0',
    fontSize: 16,
  },
  modalSave: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
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
});
