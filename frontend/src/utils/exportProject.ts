import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { Project } from './storage';

export const exportProjectToZip = async (project: Project): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Starting export for project:', project.projectName);
    
    const zip = new JSZip();
    
    // Read all files from the project folder
    const folderPath = project.folderPath;
    console.log('Reading from folder:', folderPath);
    
    // Check if folder exists
    const folderInfo = await FileSystem.getInfoAsync(folderPath);
    if (!folderInfo.exists) {
      return { success: false, error: 'Project folder not found' };
    }
    
    // Read directory contents
    const files = await FileSystem.readDirectoryAsync(folderPath);
    console.log('Files in folder:', files);
    
    for (const fileName of files) {
      const filePath = `${folderPath}${fileName}`;
      
      try {
        // Check if it's a binary file (audio)
        if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg') ||
            fileName.endsWith('.m4a') || fileName.endsWith('.aac')) {
          const content = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          zip.file(fileName, content, { base64: true });
          console.log('Added binary file:', fileName);
        } else {
          const content = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          zip.file(fileName, content);
          console.log('Added text file:', fileName);
        }
      } catch (fileError) {
        console.error('Error reading file:', fileName, fileError);
      }
    }
    
    // Generate ZIP
    console.log('Generating ZIP...');
    const zipBase64 = await zip.generateAsync({ type: 'base64' });
    
    // Create filename
    const safeProjectName = project.projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetLangCode = project.targetLanguage === 'Swiss German' ? 'chde' : 
                          project.targetLanguage === 'German' ? 'de' : 
                          project.targetLanguage.toLowerCase().substring(0, 2);
    const nativeLangCode = project.nativeLanguage === 'English' ? 'en' : 
                          project.nativeLanguage.toLowerCase().substring(0, 2);
    const zipFileName = `${targetLangCode}-${nativeLangCode}-${safeProjectName}.zip`;
    
    // Save ZIP to cache directory
    const zipPath = `${FileSystem.cacheDirectory}${zipFileName}`;
    await FileSystem.writeAsStringAsync(zipPath, zipBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('ZIP saved to:', zipPath);
    
    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: `Share ${project.projectName}`,
      });
      console.log('Sharing dialog opened');
      
      // Clean up after sharing
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(zipPath, { idempotent: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
      
      return { success: true };
    } else {
      return { success: false, error: 'Sharing is not available on this device' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error exporting project:', errorMessage, error);
    return { success: false, error: `Export failed: ${errorMessage}` };
  }
};
