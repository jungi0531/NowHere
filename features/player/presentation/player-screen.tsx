import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';

export function PlayerScreen() {
  return (
    <AppScreen align="center" justify="center" tone="deep">
      <View style={styles.container}>
        <ScreenIntro align="center" eyebrow="NOW PLAYING" size="hero" title="비 내리는 마음" />

        <SurfaceCard accent style={styles.breathCard}>
          <View style={styles.breathOrb}>
            <View style={styles.breathOrbInner}>
              <Text style={styles.breathLabel}>들이쉬어요</Text>
              <Text style={styles.breathCount}>INHALE · 4</Text>
            </View>
          </View>
        </SurfaceCard>

        <Text style={styles.quote}>&quot;편안히 앉아 눈을 감아주세요.&quot;</Text>

        <View style={styles.progressWrap}>
          <Text style={styles.time}>00:01</Text>
          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
          <Text style={styles.time}>05:00</Text>
        </View>

        <View style={styles.actions}>
          <AppButton label="홈으로" kind="secondary" onPress={() => router.push('/home')} />
          <AppButton label="다시 생성 흐름 보기" onPress={() => router.push('/generating')} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 24,
    alignItems: 'center',
  },
  breathCard: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
  },
  breathOrb: {
    width: 228,
    height: 228,
    borderRadius: 999,
    backgroundColor: 'rgba(207, 224, 206, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathOrbInner: {
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(251, 253, 248, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  breathLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#264029',
    marginBottom: 8,
  },
  breathCount: {
    fontSize: 16,
    color: '#4A6750',
    fontWeight: '600',
  },
  quote: {
    fontSize: 27,
    lineHeight: 39,
    color: '#2A382D',
    textAlign: 'center',
    maxWidth: 320,
  },
  progressWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D6DED7',
    overflow: 'hidden',
  },
  fill: {
    width: '24%',
    height: '100%',
    backgroundColor: '#739274',
  },
  time: {
    fontSize: 14,
    color: '#57675A',
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 14,
  },
});
