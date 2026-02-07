import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import YAML from 'js-yaml';
import {
  Project,
  CONTENT_DIR,
  ensureContentDirectory,
  addProject,
  generateProjectId,
} from './storage';

interface ProjectYaml {
  project_name?: string;
  projectName?: string;
  target_language?: string;
  targetLanguage?: string;
  native_language?: string;
  nativeLanguage?: string;
  author?: string;
  source?: string;
  description?: string;
}

export const parseFilename = (filename: string): { targetLang: string; nativeLang: string; title: string } | null => {
  // Expected format: targetlang-nativelang-title.zip
  // e.g., chde-en-title_of_text.zip
  const nameWithoutExt = filename.replace(/\.zip$/i, '');
  const parts = nameWithoutExt.split('-');
  
  if (parts.length >= 3) {
    const targetLang = parts[0];
    const nativeLang = parts[1];
    const title = parts.slice(2).join('-');
    return { targetLang, nativeLang, title };
  } else if (parts.length === 2) {
    return { targetLang: parts[0], nativeLang: parts[1], title: 'Untitled' };
  }
  
  return { targetLang: 'unknown', nativeLang: 'unknown', title: nameWithoutExt };
};

export const importZipFromUri = async (uri: string, filename: string): Promise<boolean> => {
  try {
    await ensureContentDirectory();
    
    // Read the ZIP file
    const zipContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return await processZipContent(zipContent, filename);
  } catch (error) {
    console.error('Error importing ZIP from URI:', error);
    return false;
  }
};

export const importZipFromUrl = async (url: string): Promise<boolean> => {
  try {
    await ensureContentDirectory();
    
    // Extract filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'download.zip';
    
    // Download the ZIP file
    const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
    const downloadResult = await FileSystem.downloadAsync(url, downloadPath);
    
    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }
    
    // Read the downloaded file
    const zipContent = await FileSystem.readAsStringAsync(downloadPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Clean up
    await FileSystem.deleteAsync(downloadPath, { idempotent: true });
    
    return await processZipContent(zipContent, filename);
  } catch (error) {
    console.error('Error importing ZIP from URL:', error);
    return false;
  }
};

const processZipContent = async (base64Content: string, filename: string): Promise<boolean> => {
  try {
    const zip = new JSZip();
    await zip.loadAsync(base64Content, { base64: true });
    
    // Parse filename for language info
    const filenameParts = parseFilename(filename);
    
    // Look for project.yaml
    let projectYaml: ProjectYaml = {};
    const yamlFile = zip.file(/project\.ya?ml$/i)[0];
    if (yamlFile) {
      const yamlContent = await yamlFile.async('string');
      projectYaml = YAML.load(yamlContent) as ProjectYaml || {};
    }
    
    // Determine project details (prioritize YAML, fall back to filename)
    const projectName = projectYaml.project_name || projectYaml.projectName || filenameParts?.title || 'Untitled Project';
    const targetLanguage = projectYaml.target_language || projectYaml.targetLanguage || filenameParts?.targetLang || 'Unknown';
    const nativeLanguage = projectYaml.native_language || projectYaml.nativeLanguage || filenameParts?.nativeLang || 'Unknown';
    const author = projectYaml.author || undefined;
    const source = projectYaml.source || 'source_undefined';
    
    // Create folder structure: content/targetLang/nativeLang/source/projectName_id/
    const projectId = generateProjectId();
    const safeProjectName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderPath = `${CONTENT_DIR}${targetLanguage}/${nativeLanguage}/${source || 'source_undefined'}/${safeProjectName}_${projectId}/`;
    
    // Create directory
    await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
    
    // Extract all files
    const files = Object.keys(zip.files);
    for (const filePath of files) {
      const zipEntry = zip.files[filePath];
      if (!zipEntry.dir) {
        // Get just the filename (without any directory structure from ZIP)
        const fileName = filePath.split('/').pop() || filePath;
        const destPath = `${folderPath}${fileName}`;
        
        // Check if it's a binary file (like mp3)
        if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg')) {
          const content = await zipEntry.async('base64');
          await FileSystem.writeAsStringAsync(destPath, content, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          const content = await zipEntry.async('string');
          await FileSystem.writeAsStringAsync(destPath, content, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        }
      }
    }
    
    // Create and save project
    const project: Project = {
      id: projectId,
      projectName,
      targetLanguage,
      nativeLanguage,
      author,
      source: source || undefined,
      description: projectYaml.description,
      folderPath,
      createdAt: new Date().toISOString(),
    };
    
    await addProject(project);
    
    return true;
  } catch (error) {
    console.error('Error processing ZIP content:', error);
    return false;
  }
};
