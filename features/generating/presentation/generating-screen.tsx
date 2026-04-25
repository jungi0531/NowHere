import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { generateMeditationScript } from '@/infrastructure/ai/gemini';
import { generateAudio } from '@/infrastructure/ai/tts';
import { logSession } from '@/infrastructure/db/sessions';
import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';
import { useSessionDraftStore } from '@/shared/store/session-draft';

type StepState = 'idle' | 'active' | 'done' | 'error';

const STEP_LABELS: { ko: string; en: string }[] = [
  { ko: '오늘의 마음을 읽는 중', en: "Reading today's entry" },
  { ko: '스크립트를 쓰는 중', en: 'Composing the script' },
  { ko: '목소리를 빚는 중', en: 'Shaping the voice' },
  { ko: '완성했어요', en: 'Ready' },
];

export function GeneratingScreen() {
  const mood = useSessionDraftStore((s) => s.mood);
  const energy = useSessionDraftStore((s) => s.energy);
  const note = useSessionDraftStore((s) => s.note);
  const duration = useSessionDraftStore((s) => s.duration);
  const setAudioUri = useSessionDraftStore((s) => s.setAudioUri);
  const setSessionId = useSessionDraftStore((s) => s.setSessionId);

  const [stepStates, setStepStates] = useState<StepState[]>(['active', 'idle', 'idle', 'idle']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ran = useRef(false);

  function markDone(index: number) {
    setStepStates((prev) => {
      const next = [...prev] as StepState[];
      next[index] = 'done';
      if (index + 1 < next.length) next[index + 1] = 'active';
      return next;
    });
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      try {
        const id = Math.random().toString(36).slice(2);
        setSessionId(id);

        // Step 0: read entry (visual only — already have data)
        await new Promise((r) => setTimeout(r, 600));
        markDone(0);

        // Step 1: generate script
        const script = await generateMeditationScript({ mood, energy, note, duration });
        markDone(1);

        // Step 2: generate TTS audio
        const uri = await generateAudio(script, id);
        setAudioUri(uri);
        markDone(2);

        // Step 3: log session
        await logSession({
          id,
          mood,
          energy,
          note,
          duration,
          scriptText: script,
          audioUri: uri,
          createdAt: new Date().toISOString(),
        });
        markDone(3);

        router.replace('/player');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setErrorMessage(message);
        setStepStates((prev) => prev.map((s) => (s === 'active' ? 'error' : s)) as StepState[]);
      }
    }

    void run();
  }, [mood, energy, note, duration, setAudioUri, setSessionId]);

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
          {STEP_LABELS.map((label, index) => {
            const state = stepStates[index];
            return (
              <View key={label.ko} style={styles.stepRow}>
                <View
                  style={[
                    styles.dot,
                    state === 'active' && styles.dotActive,
                    state === 'done' && styles.dotDone,
                    state === 'error' && styles.dotError,
                  ]}
                />
                <View style={styles.stepTextWrap}>
                  <Text style={styles.stepKo}>{label.ko}</Text>
                  <Text style={styles.stepEn}>{label.en}</Text>
                </View>
                {state === 'active' ? <Text style={styles.spinner}>…</Text> : null}
                {state === 'done' ? <Text style={styles.check}>✓</Text> : null}
              </View>
            );
          })}
        </SurfaceCard>

        {errorMessage ? (
          <>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <AppButton label="다시 시도" onPress={() => router.replace('/generating')} />
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 24, alignItems: 'center' },
  progressCard: { width: '100%', gap: 18, paddingTop: 24, paddingBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 999, backgroundColor: '#CFD6D0' },
  dotActive: { backgroundColor: '#7A9B79' },
  dotDone: { backgroundColor: '#51775B' },
  dotError: { backgroundColor: '#B55A5A' },
  stepTextWrap: { flex: 1, gap: 2 },
  stepKo: { fontSize: 16, fontWeight: '700', color: '#273027' },
  stepEn: { fontSize: 13, color: '#718077' },
  spinner: { fontSize: 18, color: '#7A9B79' },
  check: { fontSize: 16, color: '#51775B', fontWeight: '700' },
  errorText: { fontSize: 14, color: '#B55A5A', textAlign: 'center', maxWidth: 300 },
});
