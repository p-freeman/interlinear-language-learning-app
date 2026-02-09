import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import {
  Project,
  CONTENT_DIR,
  ensureContentDirectory,
  addProject,
  generateProjectId,
  getProjects,
  saveWebContent,
} from './storage';

// Sample interlinear HTML content
const SAMPLE_INTERLINEAR_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    .interlinear-container {
      padding: 10px;
    }
    .word-pair {
      display: inline-block;
      text-align: center;
      margin: 8px 4px;
      vertical-align: top;
    }
    .target-word {
      font-size: 18px;
      font-weight: bold;
      color: #6c5ce7;
      display: block;
    }
    .native-word {
      font-size: 14px;
      color: #a0a0c0;
      display: block;
      margin-top: 4px;
    }
    .sentence {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #1a1a2e;
      border-radius: 12px;
    }
    .sentence-number {
      color: #6c5ce7;
      font-size: 12px;
      margin-bottom: 8px;
    }
    h2 {
      color: #fff;
      margin-bottom: 20px;
    }
    p.intro {
      color: #a0a0c0;
      line-height: 1.6;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="interlinear-container">
    <h2>Greetings in Swiss German</h2>
    <p class="intro">
      Welcome to this sample lesson! Below you'll find common Swiss German greetings with word-by-word English translations. 
      Read along while listening to the audio to practice the Birkenbihl decoding method.
    </p>
    
    <div class="sentence">
      <div class="sentence-number">Sentence 1</div>
      <span class="word-pair">
        <span class="target-word">Grüezi</span>
        <span class="native-word">Hello (formal)</span>
      </span>
      <span class="word-pair">
        <span class="target-word">mitenand!</span>
        <span class="native-word">together!</span>
      </span>
    </div>
    
    <div class="sentence">
      <div class="sentence-number">Sentence 2</div>
      <span class="word-pair">
        <span class="target-word">Wie</span>
        <span class="native-word">How</span>
      </span>
      <span class="word-pair">
        <span class="target-word">gaht's</span>
        <span class="native-word">goes-it</span>
      </span>
      <span class="word-pair">
        <span class="target-word">Ihne?</span>
        <span class="native-word">you (formal)?</span>
      </span>
    </div>
    
    <div class="sentence">
      <div class="sentence-number">Sentence 3</div>
      <span class="word-pair">
        <span class="target-word">Mir</span>
        <span class="native-word">To-me</span>
      </span>
      <span class="word-pair">
        <span class="target-word">gaht's</span>
        <span class="native-word">goes-it</span>
      </span>
      <span class="word-pair">
        <span class="target-word">guet,</span>
        <span class="native-word">good,</span>
      </span>
      <span class="word-pair">
        <span class="target-word">merci!</span>
        <span class="native-word">thank-you!</span>
      </span>
    </div>
    
    <div class="sentence">
      <div class="sentence-number">Sentence 4</div>
      <span class="word-pair">
        <span class="target-word">Uf</span>
        <span class="native-word">Until</span>
      </span>
      <span class="word-pair">
        <span class="target-word">Wiederluege!</span>
        <span class="native-word">seeing-again!</span>
      </span>
    </div>
    
    <div class="sentence">
      <div class="sentence-number">Sentence 5</div>
      <span class="word-pair">
        <span class="target-word">Schöne</span>
        <span class="native-word">Beautiful</span>
      </span>
      <span class="word-pair">
        <span class="target-word">Tag</span>
        <span class="native-word">day</span>
      </span>
      <span class="word-pair">
        <span class="target-word">no!</span>
        <span class="native-word">still!</span>
      </span>
    </div>
    
    <div class="sentence">
      <div class="sentence-number">Sentence 6 - Numbers</div>
      <span class="word-pair">
        <span class="target-word">Eis</span>
        <span class="native-word">One</span>
      </span>
      <span class="word-pair">
        <span class="target-word">zwei</span>
        <span class="native-word">two</span>
      </span>
      <span class="word-pair">
        <span class="target-word">drü</span>
        <span class="native-word">three</span>
      </span>
      <span class="word-pair">
        <span class="target-word">vier</span>
        <span class="native-word">four</span>
      </span>
      <span class="word-pair">
        <span class="target-word">föif</span>
        <span class="native-word">five</span>
      </span>
    </div>
  </div>
</body>
</html>`;

const SAMPLE_PROJECT_YAML = `project_name: Sample Lesson - Greetings
target_language: Swiss German
native_language: English
author: Interlinear Team
source: Sample Content
description: A sample lesson to demonstrate the Birkenbihl method with basic Swiss German greetings.`;

const SAMPLE_WORDS_TARGET = `Grüezi
mitenand
Wie
gaht's
Ihne
Mir
guet
merci
Uf
Wiederluege
Schöne
Tag
no
Eis
zwei
drü
vier
föif`;

const SAMPLE_WORDS_NATIVE = `Hello (formal)
together
How
goes-it
you (formal)
To-me
good
thank-you
Until
seeing-again
Beautiful
day
still
One
two
three
four
five`;

export const installSampleContent = async (): Promise<boolean> => {
  try {
    console.log('Starting sample content installation...');
    console.log('Platform:', Platform.OS);
    
    await ensureContentDirectory();
    
    // Check if sample content already exists
    const existingProjects = await getProjects();
    console.log('Existing projects:', existingProjects.length);
    
    const sampleExists = existingProjects.some(
      p => p.projectName === 'Sample Lesson - Greetings' && p.source === 'Sample Content'
    );
    
    if (sampleExists) {
      console.log('Sample content already exists');
      return true; // Already installed
    }
    
    const projectId = generateProjectId();
    console.log('Generated project ID:', projectId);
    
    if (Platform.OS === 'web') {
      // For web platform, store content in AsyncStorage
      console.log('Installing for web platform...');
      
      const project: Project = {
        id: projectId,
        projectName: 'Sample Lesson - Greetings',
        targetLanguage: 'Swiss German',
        nativeLanguage: 'English',
        author: 'Interlinear Team',
        source: 'Sample Content',
        description: 'A sample lesson to demonstrate the Birkenbihl method with basic Swiss German greetings.',
        folderPath: `web_content/${projectId}`,
        createdAt: new Date().toISOString(),
        htmlContent: SAMPLE_INTERLINEAR_HTML,
      };
      
      // Save HTML content separately for web
      await saveWebContent(projectId, SAMPLE_INTERLINEAR_HTML);
      await addProject(project);
      
      console.log('Web sample content installed successfully');
      return true;
    } else {
      // For native platforms, use file system
      console.log('Installing for native platform...');
      
      const folderPath = `${CONTENT_DIR}Swiss German/English/Sample Content/Sample_Lesson_Greetings_${projectId}/`;
      console.log('Folder path:', folderPath);
      
      // Create directory
      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
      console.log('Directory created');
      
      // Write files
      await FileSystem.writeAsStringAsync(
        `${folderPath}interlinear.html`,
        SAMPLE_INTERLINEAR_HTML,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      console.log('HTML file written');
      
      await FileSystem.writeAsStringAsync(
        `${folderPath}project.yaml`,
        SAMPLE_PROJECT_YAML,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      
      await FileSystem.writeAsStringAsync(
        `${folderPath}words_target.txt`,
        SAMPLE_WORDS_TARGET,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      
      await FileSystem.writeAsStringAsync(
        `${folderPath}words_native.txt`,
        SAMPLE_WORDS_NATIVE,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      
      console.log('All files written');
      
      // Create and save project
      const project: Project = {
        id: projectId,
        projectName: 'Sample Lesson - Greetings',
        targetLanguage: 'Swiss German',
        nativeLanguage: 'English',
        author: 'Interlinear Team',
        source: 'Sample Content',
        description: 'A sample lesson to demonstrate the Birkenbihl method with basic Swiss German greetings.',
        folderPath,
        createdAt: new Date().toISOString(),
      };
      
      await addProject(project);
      console.log('Project added to storage');
      
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error installing sample content:', errorMessage, error);
    throw new Error(`Sample content installation failed: ${errorMessage}`);
  }
};
