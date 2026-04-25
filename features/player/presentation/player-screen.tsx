import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';
import { useSessionDraftStore } from '@/shared/store/session-draft';

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function PlayerScreen() {
  const mood = useSessionDraftStore((state) => state.mood);
  const duration = useSessionDraftStore((state) => state.duration);
  const note = useSessionDraftStore((state) => state.note);
  const reset = useSessionDraftStore((state) => state.reset);
  const audioUri = useSessionDraftStore((state) => state.audioUri);
  const totalSeconds = duration * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!audioUri) return;
    let sound: Audio.Sound | null = null;

    async function loadAndPlay() {
      const { sound: s } = await Audio.Sound.createAsync({ uri: audioUri! });
      sound = s;
      await sound.playAsync();
    }

    void loadAndPlay();

    return () => {
      void sound?.unloadAsync();
    };
  }, [audioUri]);

  useEffect(() => {
    setElapsedSeconds(0);
  }, [duration]);

  useEffect(() => {
    if (elapsedSeconds >= totalSeconds) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => {
        if (current >= totalSeconds) {
          return current;
        }
        return current + 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [elapsedSeconds, totalSeconds]);

  const progressWidth = `${Math.min(100, (elapsedSeconds / totalSeconds) * 100)}%` as const;
  const breathPhase = Math.floor(elapsedSeconds / 4) % 2 === 0 ? '들이쉬어요' : '내쉬어요';
  const breathCount = Math.floor(elapsedSeconds / 4) % 2 === 0 ? 'INHALE · 4' : 'EXHALE · 4';

  return (
    <AppScreen align="center" justify="center" tone="deep">
      <View style={styles.container}>
        <ScreenIntro
          align="center"
          eyebrow="NOW PLAYING"
          size="hero"
          title={`${mood} 마음을 위한 ${duration}분`}
          body={note ? note : '오늘의 입력을 바탕으로 조용히 호흡을 이어가 보세요.'}
        />

        <SurfaceCard accent style={styles.breathCard}>
          <View style={styles.breathOrb}>
            <View style={styles.breathOrbInner}>
              <Text style={styles.breathLabel}>{breathPhase}</Text>
              <Text style={styles.breathCount}>{breathCount}</Text>
            </View>
          </View>
        </SurfaceCard>

        <Text style={styles.quote}>&quot;{mood}한 마음을 있는 그대로 두고 호흡을 따라가 보세요.&quot;</Text>

        <View style={styles.progressWrap}>
          <Text style={styles.time}>{formatClock(elapsedSeconds)}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: progressWidth }]} />
          </View>
          <Text style={styles.time}>{formatClock(totalSeconds)}</Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            label="홈으로"
            kind="secondary"
            onPress={() => {
              reset();
              router.replace('/home');
            }}
          />
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
