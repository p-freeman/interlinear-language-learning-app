import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface Project {
  id: string;
  projectName: string;
  targetLanguage: string;
  nativeLanguage: string;
  author?: string;
  source?: string;
  description?: string;
  folderPath: string;
  createdAt: string;
  // For web platform - store content directly
  htmlContent?: string;
  audioBase64?: string;
}

const PROJECTS_KEY = 'interlinear_projects';
const WEB_CONTENT_KEY = 'interlinear_web_content';

export const CONTENT_DIR = Platform.OS === 'web' 
  ? 'web_content/' 
  : `${FileSystem.documentDirectory}content/`;

export const ensureContentDirectory = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // No need to create directory on web
    return;
  }
  try {
    const dirInfo = await FileSystem.getInfoAsync(CONTENT_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CONTENT_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Error ensuring content directory:', error);
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const data = await AsyncStorage.getItem(PROJECTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
};

export const saveProjects = async (projects: Project[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
    throw error;
  }
};

export const addProject = async (project: Project): Promise<void> => {
  const projects = await getProjects();
  projects.push(project);
  await saveProjects(projects);
};

export const getProject = async (id: string): Promise<Project | null> => {
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    await saveProjects(projects);
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === id);
  
  if (project) {
    // Delete the project folder (only on native platforms)
    if (Platform.OS !== 'web') {
      try {
        const folderInfo = await FileSystem.getInfoAsync(project.folderPath);
        if (folderInfo.exists) {
          await FileSystem.deleteAsync(project.folderPath, { idempotent: true });
        }
      } catch (error) {
        console.error('Error deleting project folder:', error);
      }
    }
    
    // Remove from the list
    const newProjects = projects.filter(p => p.id !== id);
    await saveProjects(newProjects);
  }
};

export const generateProjectId = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Store HTML content for web platform
export const saveWebContent = async (projectId: string, htmlContent: string): Promise<void> => {
  try {
    const key = `${WEB_CONTENT_KEY}_${projectId}`;
    await AsyncStorage.setItem(key, htmlContent);
  } catch (error) {
    console.error('Error saving web content:', error);
  }
};

// Get HTML content for web platform
export const getWebContent = async (projectId: string): Promise<string | null> => {
  try {
    const key = `${WEB_CONTENT_KEY}_${projectId}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error getting web content:', error);
    return null;
  }
};
