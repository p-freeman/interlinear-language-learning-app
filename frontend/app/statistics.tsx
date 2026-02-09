import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../src/contexts/SettingsContext';
import { translations } from '../src/i18n/translations';
import {
  getStatisticsForPeriod,
  StudyStatistics,
  formatDuration,
  exportStatisticsAsText,
  clearStatistics,
} from '../src/utils/statistics';

type Period = 'week' | 'month' | 'all';

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const t = translations[settings.appLanguage];
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<StudyStatistics | null>(null);
  const [period, setPeriod] = useState<Period>('all');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const statistics = await getStatisticsForPeriod(period);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportStatisticsAsText();
      if (!result.success) {
        Alert.alert(t.error, result.error || t.failedToExport);
      }
    } catch (error) {
      Alert.alert(t.error, t.failedToExport);
    } finally {
      setExporting(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      t.delete,
      'Are you sure you want to clear all statistics?',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.yes,
          style: 'destructive',
          onPress: async () => {
            await clearStatistics();
            loadStats();
          },
        },
      ]
    );
  };

  const getPeriodLabel = (p: Period): string => {
    switch (p) {
      case 'week': return t.thisWeek;
      case 'month': return t.thisMonth;
      case 'all': return t.allTime;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  const avgSessionMs = stats && stats.sessionsCount > 0 
    ? stats.totalStudyTimeMs / stats.sessionsCount 
    : 0;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'all'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {getPeriodLabel(p)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!stats || stats.sessionsCount === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={80} color="#4a4a6a" />
            <Text style={styles.emptyTitle}>{t.noStatisticsYet}</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.cardsContainer}>
              <View style={[styles.card, styles.cardPrimary]}>
                <Ionicons name="time-outline" size={32} color="#fff" />
                <Text style={styles.cardValue}>{formatDuration(stats.totalStudyTimeMs)}</Text>
                <Text style={styles.cardLabel}>{t.totalStudyTime}</Text>
              </View>

              <View style={styles.cardRow}>
                <View style={[styles.card, styles.cardHalf]}>
                  <Ionicons name="book-outline" size={24} color="#6c5ce7" />
                  <Text style={styles.cardValueSmall}>{formatDuration(stats.totalActiveReadingMs)}</Text>
                  <Text style={styles.cardLabelSmall}>{t.activeReadingTime}</Text>
                </View>

                <View style={[styles.card, styles.cardHalf]}>
                  <Ionicons name="headset-outline" size={24} color="#00b894" />
                  <Text style={styles.cardValueSmall}>{formatDuration(stats.totalPassiveListeningMs)}</Text>
                  <Text style={styles.cardLabelSmall}>{t.passiveListeningTime}</Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <View style={[styles.card, styles.cardHalf]}>
                  <Ionicons name="layers-outline" size={24} color="#f39c12" />
                  <Text style={styles.cardValueSmall}>{stats.sessionsCount}</Text>
                  <Text style={styles.cardLabelSmall}>{t.sessionsCount}</Text>
                </View>

                <View style={[styles.card, styles.cardHalf]}>
                  <Ionicons name="timer-outline" size={24} color="#e74c3c" />
                  <Text style={styles.cardValueSmall}>{formatDuration(avgSessionMs)}</Text>
                  <Text style={styles.cardLabelSmall}>{t.averageSessionLength}</Text>
                </View>
              </View>
            </View>

            {/* Recent Sessions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              {stats.sessions.slice(-10).reverse().map((session) => (
                <View key={session.id} style={styles.sessionRow}>
                  <View style={styles.sessionIcon}>
                    <Ionicons
                      name={session.type === 'active_reading' ? 'book' : 'headset'}
                      size={18}
                      color={session.type === 'active_reading' ? '#6c5ce7' : '#00b894'}
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionProject} numberOfLines={1}>
                      {session.projectName}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.durationMs)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
            <Text style={styles.actionButtonText}>{t.exportStatistics}</Text>
          </TouchableOpacity>

          {stats && stats.sessionsCount > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={handleClear}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  periodText: {
    color: '#a0a0c0',
    fontSize: 14,
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#a0a0c0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  cardPrimary: {
    backgroundColor: '#6c5ce7',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardHalf: {
    flex: 1,
  },
  cardValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  cardValueSmall: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardLabelSmall: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionProject: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionDate: {
    color: '#a0a0c0',
    fontSize: 12,
    marginTop: 2,
  },
  sessionDuration: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
  },
  actionButtonDanger: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
