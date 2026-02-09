import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../src/contexts/SettingsContext';
import { translations } from '../src/i18n/translations';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const t = translations[settings.appLanguage];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="book" size={80} color="#6c5ce7" />
          <Text style={styles.title}>Interlinear</Text>
          <Text style={styles.subtitle}>Language Learning App</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
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
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#a0a0c0',
    fontSize: 16,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  version: {
    color: '#4a4a6a',
    fontSize: 14,
  },
});
