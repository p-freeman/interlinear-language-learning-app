import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { getProject, getWebContent, Project } from '../../src/utils/storage';
import Slider from '@react-native-community/slider';

export default function InterlinearScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    loadProject();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      const loadedProject = await getProject(id);
      if (loadedProject) {
        setProject(loadedProject);
        await loadHtml(loadedProject);
        await loadAudio(loadedProject);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHtml = async (proj: Project) => {
    try {
      let content = '';
      
      if (Platform.OS === 'web') {
        // For web, get content from storage or project
        const webContent = await getWebContent(proj.id);
        if (webContent) {
          content = webContent;
        } else if (proj.htmlContent) {
          content = proj.htmlContent;
        }
      } else {
        // For native platforms, read from file system
        const htmlPath = `${proj.folderPath}/interlinear.html`;
        const fileInfo = await FileSystem.getInfoAsync(htmlPath);
        if (fileInfo.exists) {
          content = await FileSystem.readAsStringAsync(htmlPath);
        }
      }
      
      if (content) {
        // Wrap HTML with zoom styling
        const wrappedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
            <style>
              body {
                background-color: #0f0f1a;
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 16px;
                margin: 0;
                line-height: 1.6;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
          </html>
        `;
        setHtmlContent(wrappedHtml);
      } else {
        setHtmlContent('<html><body><h2 style="color:#fff;text-align:center;padding:20px;">No interlinear.html file found in this project.</h2></body></html>');
      }
    } catch (error) {
      console.error('Error loading HTML:', error);
      setHtmlContent('<html><body><h2 style="color:#fff;text-align:center;padding:20px;">Error loading interlinear text.</h2></body></html>');
    }
  };

  const loadAudio = async (proj: Project) => {
    // Skip audio on web platform for now
    if (Platform.OS === 'web') {
      console.log('Audio playback not supported on web preview');
      return;
    }
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const audioPath = `${proj.folderPath}/audio.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(audioPath);
      
      if (fileInfo.exists) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioPath },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const seekTo = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 20, 200);
    setZoomLevel(newZoom);
    webViewRef.current?.injectJavaScript(`document.body.style.zoom = '${newZoom}%'; true;`);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 20, 60);
    setZoomLevel(newZoom);
    webViewRef.current?.injectJavaScript(`document.body.style.zoom = '${newZoom}%'; true;`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Ionicons name="remove" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.zoomText}>{zoomLevel}%</Text>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* WebView for HTML Content */}
      <View style={styles.webViewContainer}>
        {htmlContent ? (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={styles.webView}
            originWhitelist={['*']}
            scalesPageToFit={true}
            javaScriptEnabled={true}
          />
        ) : (
          <View style={styles.centered}>
            <Text style={styles.noContentText}>No content available</Text>
          </View>
        )}
      </View>

      {/* Audio Player */}
      <View style={[styles.audioPlayer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[styles.playButton, !sound && styles.disabledButton]}
            onPress={togglePlayPause}
            disabled={!sound}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seekTo}
              minimumTrackTintColor="#6c5ce7"
              maximumTrackTintColor="#2a2a4e"
              thumbTintColor="#6c5ce7"
              disabled={!sound}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
        
        {!sound && (
          <Text style={styles.noAudioText}>No audio file available</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 50,
    textAlign: 'center',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  noContentText: {
    color: '#a0a0c0',
    fontSize: 16,
  },
  audioPlayer: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    color: '#a0a0c0',
    fontSize: 12,
  },
  noAudioText: {
    color: '#a0a0c0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
