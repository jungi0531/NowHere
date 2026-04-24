import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';
import { useSessionDraftStore } from '@/shared/store/session-draft';

const steps = [
  { labelKo: '오늘의 마음을 읽는 중', labelEn: "Reading today's entry", state: 'done' },
  { labelKo: '스크립트를 쓰는 중', labelEn: 'Composing the script', state: 'active' },
  { labelKo: '목소리를 빚는 중', labelEn: 'Shaping the voice', state: 'idle' },
  { labelKo: '완성했어요', labelEn: 'Ready', state: 'idle' },
] as const;

export function GeneratingScreen() {
  const duration = useSessionDraftStore((state) => state.duration);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace('/player');
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AppScreen align="center" justify="center" tone="deep">
      <View style={styles.container}>
        <ScreenIntro
          align="center"
          eyebrow="GENERATING"
          size="hero"
          title={'오늘의 마음을\n읽고 있어요'}
          body={`약 ${duration}분 길이의 가이드를 만들고 있어요.`}
        />

        <SurfaceCard accent style={styles.progressCard}>
          {steps.map((step, index) => (
            <View key={step.labelKo} style={styles.stepRow}>
              <View
                style={[
                  styles.dot,
                  step.state === 'active' && styles.dotActive,
                  step.state === 'done' && styles.dotDone,
                ]}
              />
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepKo}>{step.labelKo}</Text>
                <Text style={styles.stepEn}>{step.labelEn}</Text>
              </View>
              {index === 1 ? <Text style={styles.percent}>50%</Text> : null}
            </View>
          ))}
        </SurfaceCard>

        <AppButton label="플레이어 보기" onPress={() => router.replace('/player')} />
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
  progressCard: {
    width: '100%',
    gap: 18,
    paddingTop: 24,
    paddingBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#CFD6D0',
  },
  dotActive: {
    backgroundColor: '#7A9B79',
  },
  dotDone: {
    backgroundColor: '#51775B',
  },
  stepTextWrap: {
    flex: 1,
    gap: 2,
  },
  stepKo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#273027',
  },
  stepEn: {
    fontSize: 13,
    color: '#718077',
  },
  percent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#55785A',
  },
});
