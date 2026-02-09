import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { getProjects, Project } from '../src/utils/storage';
import { useSettings } from '../src/contexts/SettingsContext';
import { translations } from '../src/i18n/translations';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const t = translations[settings.appLanguage];
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedProjects, setGroupedProjects] = useState<Record<string, Record<string, Project[]>>>({});

  const loadProjects = async () => {
    try {
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
      
      // Group by target language -> native language
      const grouped: Record<string, Record<string, Project[]>> = {};
      loadedProjects.forEach(project => {
        const targetLang = project.targetLanguage || 'Unknown';
        const nativeLang = project.nativeLanguage || 'Unknown';
        
        if (!grouped[targetLang]) {
          grouped[targetLang] = {};
        }
        if (!grouped[targetLang][nativeLang]) {
          grouped[targetLang][nativeLang] = [];
        }
        grouped[targetLang][nativeLang].push(project);
      });
      setGroupedProjects(grouped);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6c5ce7"
          />
        }
      >
        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={80} color="#4a4a6a" />
            <Text style={styles.emptyTitle}>No Content Yet</Text>
            <Text style={styles.emptyText}>
              Import language learning content to get started.
              Tap the + button below to import a content package.
            </Text>
          </View>
        ) : (
          Object.entries(groupedProjects).map(([targetLang, nativeGroups]) => (
            <View key={targetLang} style={styles.languageSection}>
              <Text style={styles.targetLanguageHeader}>
                <Ionicons name="language" size={20} color="#6c5ce7" />
                {' Learn ' + targetLang}
              </Text>
              {Object.entries(nativeGroups).map(([nativeLang, langProjects]) => (
                <View key={nativeLang} style={styles.nativeSection}>
                  <Text style={styles.nativeLanguageHeader}>
                    From {nativeLang}
                  </Text>
                  {langProjects.map(project => (
                    <TouchableOpacity
                      key={project.id}
                      style={styles.projectCard}
                      onPress={() => router.push(`/project/${project.id}`)}
                    >
                      <View style={styles.projectIcon}>
                        <Ionicons name="book" size={24} color="#6c5ce7" />
                      </View>
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                          {project.projectName}
                        </Text>
                        {project.author && (
                          <Text style={styles.projectMeta}>
                            By {project.author}
                          </Text>
                        )}
                        {project.source && (
                          <Text style={styles.projectMeta}>
                            Source: {project.source}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#4a4a6a" />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push('/import')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 100,
  },
  loadingText: {
    color: '#a0a0c0',
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyText: {
    color: '#a0a0c0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  languageSection: {
    marginBottom: 24,
  },
  targetLanguageHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nativeSection: {
    marginLeft: 12,
    marginBottom: 16,
  },
  nativeLanguageHeader: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  projectMeta: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
