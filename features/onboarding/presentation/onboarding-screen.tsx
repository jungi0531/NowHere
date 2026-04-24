import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';

export function OnboardingScreen() {
  return (
    <AppScreen align="center" justify="center" tone="sage">
      <View style={styles.content}>
        <View style={styles.brandPill}>
          <Text style={styles.brand}>NOWHERE · 지금여기</Text>
        </View>
        <ScreenIntro
          align="center"
          size="hero"
          title={'오늘의 마음을\n지금 여기에\n내려놓아요'}
          body="오늘의 기분을 짧게 기록하면 당신만을 위한 명상 세션을 만들어 드려요."
        />

        <SurfaceCard accent style={styles.messageCard}>
          <Text style={styles.cardTitle}>이번 MVP에서 보여주는 것</Text>
          <Text style={styles.cardBody}>
            온보딩, 홈, 오늘의 기록, 길이 선택, 생성 중, 플레이어까지의 전체 흐름을 더미
            데이터로 먼저 고정합니다.
          </Text>
        </SurfaceCard>

        <View style={styles.actions}>
          <AppButton label="시작하기" onPress={() => router.push('/home')} />
          <AppButton label="이어 하기" kind="secondary" onPress={() => router.push('/home')} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    gap: 26,
    alignItems: 'center',
  },
  brandPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(250, 250, 245, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(221, 228, 218, 0.95)',
  },
  brand: {
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#66756C',
    fontWeight: '700',
  },
  messageCard: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27302A',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4E5B52',
  },
  actions: {
    width: '100%',
    gap: 14,
  },
});
