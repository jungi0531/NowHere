import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';

import { AppButton, AppScreen, ScreenIntro, SurfaceCard } from '@/shared';

const options = [
  { minutes: 3, label: '짧게', hint: '잠깐 숨 고르기', meta: '출근길, 회의 전' },
  { minutes: 5, label: '알맞게', hint: '하루의 쉼표', meta: '가장 인기' },
  { minutes: 10, label: '깊게', hint: '온전한 이완', meta: '자기 전' },
] as const;

export function MeditationLengthScreen() {
  const [selected, setSelected] = useState<3 | 5 | 10>(5);

  return (
    <AppScreen tone="sage">
      <ScreenIntro
        eyebrow="2 / 2 · 명상 길이"
        title={'얼마나\n머무를까요?'}
        body="지금 몸과 마음에 맞는 길이를 고르세요."
      />

      <View style={styles.list}>
        {options.map((option) => {
          const active = option.minutes === selected;
          return (
            <Pressable key={option.minutes} onPress={() => setSelected(option.minutes)}>
              <SurfaceCard style={[styles.option, active ? styles.optionActive : undefined]}>
                <View style={styles.optionLeft}>
                  <View style={styles.minutesWrap}>
                    <Text style={styles.minutes}>{option.minutes}</Text>
                    <Text style={styles.minutesUnit}>MIN</Text>
                  </View>
                  <View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionHint}>{option.hint}</Text>
                  </View>
                </View>
                <Text style={styles.optionMeta}>{option.meta}</Text>
              </SurfaceCard>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footerText}>오늘의 기록을 바탕으로 당신만을 위한 명상을 만들어요.</Text>
      <AppButton label="명상 만들기" onPress={() => router.push('/generating')} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  option: {
    gap: 12,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  optionActive: {
    borderColor: '#6D8C6E',
    borderWidth: 1.5,
    backgroundColor: '#EEF4EA',
  },
  optionLeft: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  minutesWrap: {
    width: 70,
  },
  minutes: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '700',
    color: '#253025',
  },
  minutesUnit: {
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#6E7B73',
    fontWeight: '700',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#243024',
    marginBottom: 3,
  },
  optionHint: {
    fontSize: 14,
    color: '#607063',
  },
  optionMeta: {
    fontSize: 13,
    color: '#68806B',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#566257',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
  },
});
