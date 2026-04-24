import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';
import { useSessionDraftStore, type SessionMood } from '@/shared/store/session-draft';

const moods = [
  { title: '맑음', description: '밝고 가벼워요', icon: '☀' },
  { title: '흐림', description: '애매하고 무거워요', icon: '☁' },
  { title: '안개', description: '생각이 흐릿해요', icon: '〰' },
  { title: '비', description: '가라앉아요', icon: '☂' },
  { title: '폭풍', description: '요동쳐요', icon: '✦' },
  { title: '눈', description: '차분해요', icon: '❄' },
] as const;

const tags = ['#업무', '#관계', '#수면', '#건강', '#막연함'];
const energyLevels = [20, 40, 60, 80, 100] as const;

export function CheckInScreen() {
  const mood = useSessionDraftStore((state) => state.mood);
  const energy = useSessionDraftStore((state) => state.energy);
  const note = useSessionDraftStore((state) => state.note);
  const setMood = useSessionDraftStore((state) => state.setMood);
  const setEnergy = useSessionDraftStore((state) => state.setEnergy);
  const setNote = useSessionDraftStore((state) => state.setNote);
  const energyWidth = `${energy}%` as const;

  return (
    <AppScreen scrollable tone="mist">
      <ScreenIntro
        eyebrow="1 / 2 · 오늘의 기록"
        title={'오늘 마음의 날씨는\n어떤가요?'}
        body="가장 가까운 하나를 고르고, 지금의 상태를 짧게 남겨보세요."
      />

      <View style={styles.moodGrid}>
        {moods.map(({ title, description, icon }) => (
          <Pressable key={title} onPress={() => setMood(title as SessionMood)} style={styles.moodPressable}>
            <SurfaceCard
              accent={title === '비'}
              style={[styles.moodCard, mood === title ? styles.moodCardActive : undefined]}>
              <Text style={styles.moodIcon}>{icon}</Text>
              <Text style={styles.moodTitle}>{title}</Text>
              <Text style={styles.moodDescription}>{description}</Text>
            </SurfaceCard>
          </Pressable>
        ))}
      </View>

      <SurfaceCard>
        <Text style={styles.label}>ENERGY · 지금 에너지</Text>
        <View style={styles.energyHeader}>
          <Text style={styles.energyHint}>지쳤어요</Text>
          <Text style={styles.energyValue}>{energy}%</Text>
          <Text style={styles.energyHint}>생생해요</Text>
        </View>
        <View style={styles.energyTrack}>
          <View style={[styles.energyFill, { width: energyWidth }]} />
        </View>
        <View style={styles.energyOptions}>
          {energyLevels.map((level) => {
            const selected = energy === level;
            return (
              <Pressable
                key={level}
                onPress={() => setEnergy(level)}
                style={[styles.energyOption, selected ? styles.energyOptionSelected : undefined]}>
                <Text style={[styles.energyOptionText, selected ? styles.energyOptionTextSelected : undefined]}>
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.label}>DIARY · 오늘의 조각</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="지금 떠오르는 감정이나 몸의 상태를 짧게 남겨보세요."
          placeholderTextColor="#7D877F"
          textAlignVertical="top"
          value={note}
          onChangeText={setNote}
        />
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <AppButton label="다음" onPress={() => router.push('/length')} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  moodCard: {
    minHeight: 124,
    justifyContent: 'space-between',
  },
  moodPressable: {
    width: '47%',
  },
  moodCardActive: {
    borderColor: '#6D8C6E',
    borderWidth: 1.5,
    backgroundColor: '#EEF4EA',
  },
  moodIcon: {
    fontSize: 24,
  },
  moodTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#253025',
    marginBottom: 6,
  },
  moodDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: '#607063',
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#69736C',
    marginBottom: 12,
  },
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  energyHint: {
    fontSize: 13,
    color: '#6A746D',
  },
  energyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B4A31',
  },
  energyTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#DDE2DC',
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#7A9B79',
  },
  energyOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  energyOption: {
    flex: 1,
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: '#E8ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyOptionSelected: {
    backgroundColor: '#7A9B79',
  },
  energyOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A675D',
  },
  energyOptionTextSelected: {
    color: '#F7F4EE',
  },
  textArea: {
    minHeight: 128,
    padding: 0,
    color: '#334034',
    fontSize: 15,
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#E8ECE5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 13,
    color: '#5A675D',
    fontWeight: '600',
  },
});
