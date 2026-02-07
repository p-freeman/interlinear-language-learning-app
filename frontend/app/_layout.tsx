import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

export default function RootLayout() {
  return (
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
        <Stack.Screen name="index" options={{ title: 'Interlinear' }} />
        <Stack.Screen name="import" options={{ title: 'Import Content' }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Project' }} />
        <Stack.Screen name="interlinear/[id]" options={{ title: 'Interlinear View' }} />
        <Stack.Screen name="audio-loop/[id]" options={{ title: 'Audio Loop' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
