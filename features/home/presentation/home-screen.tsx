import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppScreen, SurfaceCard } from '@/shared';

export function HomeScreen() {
  return (
    <AppScreen tone="sage">
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>4월 23일 · 목요일</Text>
          <Text style={styles.subtitle}>고요한 밤이에요</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streak}>4일 연속</Text>
        </View>
      </View>

      <SurfaceCard accent style={styles.heroCard}>
        <Text style={styles.sectionLabel}>TODAY&apos;S MEDITATION</Text>
        <Text style={styles.title}>{'오늘의 마음을\n들여다볼 시간이에요'}</Text>
        <Text style={styles.body}>
          기분을 짧게 적어주시면, 오늘 당신에게 맞는 명상을 만들어 드릴게요.
        </Text>
        <View style={styles.ctaWrap}>
          <AppButton label="오늘의 명상 만들기" onPress={() => router.push('/check-in')} />
          <AppButton
            kind="secondary"
            label="지난 세션"
            onPress={() => router.push('/history')}
            style={styles.secondaryBtn}
          />
        </View>
      </SurfaceCard>

      <View style={styles.statsRow}>
        <SurfaceCard style={styles.statCard}>
          <Text style={styles.statLabel}>이번 달</Text>
          <Text style={styles.statValue}>12일 명상</Text>
          <Text style={styles.statFootnote}>매일 조금씩 이어가는 중</Text>
        </SurfaceCard>
        <SurfaceCard style={styles.statCard}>
          <Text style={styles.statLabel}>평균 길이</Text>
          <Text style={styles.statValue}>5.4분</Text>
          <Text style={styles.statFootnote}>가장 자주 선택한 길이</Text>
        </SurfaceCard>
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>RECENT</Text>
        <Text style={styles.recentLink}>전체 보기</Text>
      </View>

      <SurfaceCard style={styles.recentCard}>
        <Text style={styles.recentSessionTitle}>비 내리는 마음</Text>
        <Text style={styles.recentSessionMeta}>어제 · 5분</Text>
        <Text style={styles.recentBody}>짧게 숨을 고르고, 하루를 정리하는 5분 세션</Text>
      </SurfaceCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  date: {
    fontSize: 14,
    color: '#5D665F',
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#1F261F',
  },
  streakPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 249, 244, 0.88)',
    borderWidth: 1,
    borderColor: '#DFE5DD',
  },
  streak: {
    fontSize: 14,
    color: '#5F755F',
    fontWeight: '700',
  },
  heroCard: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    color: '#1F261F',
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    color: '#4D584F',
    maxWidth: 320,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6B756E',
    marginBottom: 8,
  },
  ctaWrap: {
    marginTop: 18,
    gap: 10,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 132,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B756E',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#253025',
    marginBottom: 8,
  },
  statFootnote: {
    fontSize: 13,
    lineHeight: 20,
    color: '#647064',
  },
  recentHeader: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6B756E',
    fontWeight: '700',
  },
  recentLink: {
    fontSize: 14,
    color: '#4E6952',
    fontWeight: '600',
  },
  recentCard: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  recentSessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#243024',
    marginBottom: 6,
  },
  recentSessionMeta: {
    fontSize: 14,
    color: '#657066',
  },
  recentBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#566458',
  },
});
