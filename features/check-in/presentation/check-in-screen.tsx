import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';

const moods = [
  ['맑음', '밝고 가벼워요', '☀'],
  ['흐림', '애매하고 무거워요', '☁'],
  ['안개', '생각이 흐릿해요', '〰'],
  ['비', '가라앉아요', '☂'],
  ['폭풍', '요동쳐요', '✦'],
  ['눈', '차분해요', '❄'],
] as const;

const tags = ['#업무', '#관계', '#수면', '#건강', '#막연함'];

export function CheckInScreen() {
  return (
    <AppScreen scrollable tone="mist">
      <ScreenIntro
        eyebrow="1 / 2 · 오늘의 기록"
        title={'오늘 마음의 날씨는\n어떤가요?'}
        body="가장 가까운 하나를 고르고, 지금의 상태를 짧게 남겨보세요."
      />

      <View style={styles.moodGrid}>
        {moods.map(([title, description, icon], index) => (
          <SurfaceCard key={title} accent={index === 3} style={styles.moodCard}>
            <Text style={styles.moodIcon}>{icon}</Text>
            <Text style={styles.moodTitle}>{title}</Text>
            <Text style={styles.moodDescription}>{description}</Text>
          </SurfaceCard>
        ))}
      </View>

      <SurfaceCard>
        <Text style={styles.label}>ENERGY · 지금 에너지</Text>
        <View style={styles.energyHeader}>
          <Text style={styles.energyHint}>지쳤어요</Text>
          <Text style={styles.energyValue}>45%</Text>
          <Text style={styles.energyHint}>생생해요</Text>
        </View>
        <View style={styles.energyTrack}>
          <View style={styles.energyFill} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.label}>DIARY · 오늘의 조각</Text>
        <TextInput
          style={styles.textArea}
          multiline
          editable={false}
          value="오늘 회의가 길어져서 머리가 복잡했다. 점심에 잠깐 햇빛을 쬐니 조금 나아졌다."
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
    width: '47%',
    minHeight: 124,
    justifyContent: 'space-between',
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
    width: '45%',
    height: '100%',
    backgroundColor: '#7A9B79',
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
