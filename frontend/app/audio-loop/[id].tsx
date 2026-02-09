import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { getProject, Project } from '../../src/utils/storage';
import Slider from '@react-native-community/slider';

export default function AudioLoopScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);

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
        await loadAudio(loadedProject);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAudio = async (proj: Project) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const audioPath = `${proj.folderPath}/audio.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(audioPath);
      
      if (fileInfo.exists) {
        setHasAudio(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioPath },
          { shouldPlay: false, isLooping: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      } else {
        setHasAudio(false);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setHasAudio(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Detect loop completion
      if (status.didJustFinish && status.isLooping) {
        setLoopCount(prev => prev + 1);
      }
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

  const resetLoopCount = () => {
    setLoopCount(0);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (!hasAudio) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="musical-notes-outline" size={80} color="#4a4a6a" />
        <Text style={styles.noAudioTitle}>No Audio File</Text>
        <Text style={styles.noAudioText}>
          This project doesn't have an audio.mp3 file.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {/* Project Info */}
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{project?.projectName}</Text>
          <Text style={styles.subtitle}>Passive Listening Mode</Text>
        </View>

        {/* Loop Visualization */}
        <View style={styles.loopVisualization}>
          <View style={[styles.loopCircle, isPlaying && styles.loopCircleActive]}>
            <Ionicons
              name="repeat"
              size={60}
              color={isPlaying ? '#6c5ce7' : '#4a4a6a'}
            />
          </View>
        </View>

        {/* Loop Counter */}
        <View style={styles.loopCounterContainer}>
          <Text style={styles.loopCounterLabel}>Loops Completed</Text>
          <Text style={styles.loopCounter}>{loopCount}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetLoopCount}>
            <Ionicons name="refresh" size={16} color="#a0a0c0" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Display */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
              ]}
            />
          </View>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Slider */}
        <View style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={seekTo}
            minimumTrackTintColor="#6c5ce7"
            maximumTrackTintColor="#2a2a4e"
            thumbTintColor="#6c5ce7"
          />
        </View>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={togglePlayPause}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={48}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Audio will play continuously on loop.
          Great for passive listening practice!
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  projectName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6c5ce7',
    fontSize: 16,
    marginTop: 8,
  },
  loopVisualization: {
    marginBottom: 32,
  },
  loopCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2a2a4e',
  },
  loopCircleActive: {
    borderColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  loopCounterContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loopCounterLabel: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 8,
  },
  loopCounter: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 8,
  },
  resetText: {
    color: '#a0a0c0',
    fontSize: 14,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2a2a4e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: 2,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#a0a0c0',
    fontSize: 12,
  },
  sliderWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  playButtonActive: {
    backgroundColor: '#00b894',
  },
  infoText: {
    color: '#a0a0c0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  noAudioTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  noAudioText: {
    color: '#a0a0c0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
});
