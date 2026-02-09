import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SettingsProvider } from '../src/contexts/SettingsContext';

function HeaderRight() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push('/settings')}
      style={{ marginRight: 8, padding: 8 }}
    >
      <Ionicons name="settings-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#0f0f1a',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Interlinear',
              headerRight: () => <HeaderRight />,
            }} 
          />
          <Stack.Screen name="import" options={{ title: 'Import Content' }} />
          <Stack.Screen name="create-project" options={{ title: 'Create New Project' }} />
          <Stack.Screen name="project/[id]" options={{ title: 'Project' }} />
          <Stack.Screen name="interlinear/[id]" options={{ title: 'Interlinear View' }} />
          <Stack.Screen name="audio-loop/[id]" options={{ title: 'Audio Loop' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="statistics" options={{ title: 'Statistics' }} />
          <Stack.Screen name="help" options={{ title: 'Help' }} />
        </Stack>
      </SafeAreaProvider>
    </SettingsProvider>
  );
}
