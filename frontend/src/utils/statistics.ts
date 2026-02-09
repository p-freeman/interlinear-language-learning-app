import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface StudySession {
  id: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string;
  type: 'active_reading' | 'passive_listening';
  durationMs: number;
}

export interface StudyStatistics {
  sessions: StudySession[];
  totalActiveReadingMs: number;
  totalPassiveListeningMs: number;
  totalStudyTimeMs: number;
  sessionsCount: number;
}

const STATISTICS_KEY = 'interlinear_study_statistics';

let currentSession: {
  id: string;
  projectId: string;
  projectName: string;
  startTime: Date;
  type: 'active_reading' | 'passive_listening';
} | null = null;

export const startStudySession = (
  projectId: string,
  projectName: string,
  type: 'active_reading' | 'passive_listening'
): void => {
  currentSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    projectName,
    startTime: new Date(),
    type,
  };
  console.log('Study session started:', currentSession.id, type);
};

export const endStudySession = async (): Promise<void> => {
  if (!currentSession) return;

  const endTime = new Date();
  const durationMs = endTime.getTime() - currentSession.startTime.getTime();

  // Only record sessions longer than 5 seconds
  if (durationMs < 5000) {
    console.log('Session too short, not recording');
    currentSession = null;
    return;
  }

  const session: StudySession = {
    id: currentSession.id,
    projectId: currentSession.projectId,
    projectName: currentSession.projectName,
    startTime: currentSession.startTime.toISOString(),
    endTime: endTime.toISOString(),
    type: currentSession.type,
    durationMs,
  };

  try {
    const stats = await getStatistics();
    stats.sessions.push(session);
    
    if (session.type === 'active_reading') {
      stats.totalActiveReadingMs += durationMs;
    } else {
      stats.totalPassiveListeningMs += durationMs;
    }
    stats.totalStudyTimeMs += durationMs;
    stats.sessionsCount++;

    await AsyncStorage.setItem(STATISTICS_KEY, JSON.stringify(stats));
    console.log('Study session recorded:', session.id, formatDuration(durationMs));
  } catch (error) {
    console.error('Error saving study session:', error);
  }

  currentSession = null;
};

export const getStatistics = async (): Promise<StudyStatistics> => {
  try {
    const stored = await AsyncStorage.getItem(STATISTICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }

  return {
    sessions: [],
    totalActiveReadingMs: 0,
    totalPassiveListeningMs: 0,
    totalStudyTimeMs: 0,
    sessionsCount: 0,
  };
};

export const getStatisticsForPeriod = async (
  period: 'week' | 'month' | 'all'
): Promise<StudyStatistics> => {
  const stats = await getStatistics();
  
  if (period === 'all') {
    return stats;
  }

  const now = new Date();
  let cutoffDate: Date;

  if (period === 'week') {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const filteredSessions = stats.sessions.filter(
    s => new Date(s.startTime) >= cutoffDate
  );

  return {
    sessions: filteredSessions,
    totalActiveReadingMs: filteredSessions
      .filter(s => s.type === 'active_reading')
      .reduce((sum, s) => sum + s.durationMs, 0),
    totalPassiveListeningMs: filteredSessions
      .filter(s => s.type === 'passive_listening')
      .reduce((sum, s) => sum + s.durationMs, 0),
    totalStudyTimeMs: filteredSessions.reduce((sum, s) => sum + s.durationMs, 0),
    sessionsCount: filteredSessions.length,
  };
};

export const clearStatistics = async (): Promise<void> => {
  await AsyncStorage.removeItem(STATISTICS_KEY);
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const exportStatisticsAsText = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const stats = await getStatistics();
    
    const lines: string[] = [
      '='.repeat(50),
      'INTERLINEAR LANGUAGE LEARNING APP',
      'Study Statistics Report',
      '='.repeat(50),
      '',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '-'.repeat(50),
      'SUMMARY',
      '-'.repeat(50),
      '',
      `Total Study Time: ${formatDuration(stats.totalStudyTimeMs)}`,
      `Active Reading Time: ${formatDuration(stats.totalActiveReadingMs)}`,
      `Passive Listening Time: ${formatDuration(stats.totalPassiveListeningMs)}`,
      `Total Sessions: ${stats.sessionsCount}`,
      '',
    ];

    if (stats.sessionsCount > 0) {
      const avgSession = stats.totalStudyTimeMs / stats.sessionsCount;
      lines.push(`Average Session Length: ${formatDuration(avgSession)}`);
      lines.push('');
    }

    lines.push('-'.repeat(50));
    lines.push('SESSION HISTORY');
    lines.push('-'.repeat(50));
    lines.push('');

    // Group sessions by project
    const projectSessions: Record<string, StudySession[]> = {};
    stats.sessions.forEach(session => {
      if (!projectSessions[session.projectName]) {
        projectSessions[session.projectName] = [];
      }
      projectSessions[session.projectName].push(session);
    });

    Object.entries(projectSessions).forEach(([projectName, sessions]) => {
      const totalTime = sessions.reduce((sum, s) => sum + s.durationMs, 0);
      lines.push(`Project: ${projectName}`);
      lines.push(`  Total time: ${formatDuration(totalTime)}`);
      lines.push(`  Sessions: ${sessions.length}`);
      lines.push('');
      
      sessions.slice(-10).reverse().forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString();
        const time = new Date(session.startTime).toLocaleTimeString();
        const type = session.type === 'active_reading' ? 'Active Reading' : 'Passive Listening';
        lines.push(`    ${date} ${time} - ${type} - ${formatDuration(session.durationMs)}`);
      });
      lines.push('');
    });

    lines.push('='.repeat(50));
    lines.push('End of Report');
    lines.push('='.repeat(50));

    const content = lines.join('\n');
    const fileName = `study_statistics_${new Date().toISOString().split('T')[0]}.txt`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/plain',
        dialogTitle: 'Export Study Statistics',
      });
      return { success: true };
    } else {
      return { success: false, error: 'Sharing is not available' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error exporting statistics:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
