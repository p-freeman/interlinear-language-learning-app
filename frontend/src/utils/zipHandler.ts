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

export const importZipFromUri = async (uri: string, filename: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('importZipFromUri called with:', { uri, filename });
    
    await ensureContentDirectory();
    console.log('Content directory ensured');
    
    // Read the ZIP file
    console.log('Reading ZIP file...');
    const zipContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('ZIP file read, size:', zipContent.length);
    
    return await processZipContent(zipContent, filename);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error importing ZIP from URI:', errorMessage, error);
    return { success: false, error: `Import error: ${errorMessage}` };
  }
};

export const importZipFromUrl = async (url: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('importZipFromUrl called with:', url);
    
    await ensureContentDirectory();
    
    // Extract filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'download.zip';
    
    // Download the ZIP file
    const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
    console.log('Downloading to:', downloadPath);
    
    const downloadResult = await FileSystem.downloadAsync(url, downloadPath);
    
    if (downloadResult.status !== 200) {
      return { success: false, error: `Download failed with status ${downloadResult.status}` };
    }
    
    console.log('Download complete, reading file...');
    
    // Read the downloaded file
    const zipContent = await FileSystem.readAsStringAsync(downloadPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Clean up
    await FileSystem.deleteAsync(downloadPath, { idempotent: true });
    
    return await processZipContent(zipContent, filename);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error importing ZIP from URL:', errorMessage, error);
    return { success: false, error: `Download error: ${errorMessage}` };
  }
};

const processZipContent = async (base64Content: string, filename: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Processing ZIP content, filename:', filename);
    
    const zip = new JSZip();
    await zip.loadAsync(base64Content, { base64: true });
    console.log('ZIP loaded successfully');
    
    // List all files in ZIP
    const allFiles = Object.keys(zip.files);
    console.log('Files in ZIP:', allFiles);
    
    // Parse filename for language info
    const filenameParts = parseFilename(filename);
    console.log('Filename parts:', filenameParts);
    
    // Look for project.yaml
    let projectYaml: ProjectYaml = {};
    const yamlFiles = zip.file(/project\.ya?ml$/i);
    console.log('YAML files found:', yamlFiles.length);
    
    if (yamlFiles.length > 0) {
      const yamlFile = yamlFiles[0];
      try {
        const yamlContent = await yamlFile.async('string');
        console.log('YAML content:', yamlContent);
        const parsed = YAML.load(yamlContent);
        console.log('YAML parsed:', parsed);
        projectYaml = (parsed as ProjectYaml) || {};
      } catch (yamlError) {
        console.error('YAML parsing error:', yamlError);
        // Continue without YAML data - use filename info instead
      }
    }
    
    // Determine project details (prioritize YAML, fall back to filename)
    const projectName = projectYaml.project_name || projectYaml.projectName || filenameParts?.title || 'Untitled Project';
    const targetLanguage = projectYaml.target_language || projectYaml.targetLanguage || filenameParts?.targetLang || 'Unknown';
    const nativeLanguage = projectYaml.native_language || projectYaml.nativeLanguage || filenameParts?.nativeLang || 'Unknown';
    const author = projectYaml.author || undefined;
    
    // Handle source field - convert problematic values
    let source = projectYaml.source;
    if (source === null || source === undefined || source === '-' || source === '') {
      source = 'source_undefined';
    }
    
    console.log('Project details:', { projectName, targetLanguage, nativeLanguage, author, source });
    
    // Create folder structure: content/targetLang/nativeLang/source/projectName_id/
    const projectId = generateProjectId();
    const safeProjectName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSource = (source || 'source_undefined').replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderPath = `${CONTENT_DIR}${targetLanguage}/${nativeLanguage}/${safeSource}/${safeProjectName}_${projectId}/`;
    
    console.log('Creating folder:', folderPath);
    
    // Create directory
    await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
    console.log('Folder created');
    
    // Extract all files
    let filesExtracted = 0;
    for (const filePath of allFiles) {
      const zipEntry = zip.files[filePath];
      if (!zipEntry.dir) {
        // Get just the filename (without any directory structure from ZIP)
        const fileName = filePath.split('/').pop() || filePath;
        const destPath = `${folderPath}${fileName}`;
        
        console.log('Extracting:', fileName, 'to:', destPath);
        
        try {
          // Check if it's a binary file (like mp3)
          if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg') || 
              fileName.endsWith('.m4a') || fileName.endsWith('.aac')) {
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
          filesExtracted++;
          console.log('Extracted:', fileName);
        } catch (fileError) {
          console.error('Error extracting file:', fileName, fileError);
        }
      }
    }
    
    console.log('Files extracted:', filesExtracted);
    
    if (filesExtracted === 0) {
      return { success: false, error: 'No files could be extracted from the ZIP' };
    }
    
    // Create and save project
    const project: Project = {
      id: projectId,
      projectName,
      targetLanguage,
      nativeLanguage,
      author,
      source: source !== 'source_undefined' ? source : undefined,
      description: projectYaml.description,
      folderPath,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Saving project:', project);
    await addProject(project);
    console.log('Project saved successfully');
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing ZIP content:', errorMessage, error);
    return { success: false, error: `Processing error: ${errorMessage}` };
  }
};
