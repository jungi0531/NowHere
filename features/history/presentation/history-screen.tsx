import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { fetchRecentSessions, type SessionSummary } from '@/infrastructure/db/sessions';
import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';
import { router } from 'expo-router';

export function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppScreen scrollable tone="mist">
      <View style={styles.backRow}>
        <AppButton kind="secondary" label="← 돌아가기" onPress={() => router.back()} style={styles.backButton} />
      </View>

      <ScreenIntro eyebrow="HISTORY" title="지난 세션" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4E6952" />
        </View>
      ) : sessions.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>아직 세션이 없어요. 오늘 첫 명상을 시작해보세요.</Text>
        </SurfaceCard>
      ) : (
        sessions.map((session) => (
          <SurfaceCard key={session.id}>
            <Text style={styles.mood}>{session.mood}</Text>
            <Text style={styles.meta}>
              {session.duration}분 · {session.createdAt.slice(0, 10)}
            </Text>
          </SurfaceCard>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignItems: 'flex-start',
  },
  backButton: {
    minHeight: 44,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#526056',
  },
  mood: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D241E',
  },
  meta: {
    fontSize: 14,
    color: '#657066',
  },
});
