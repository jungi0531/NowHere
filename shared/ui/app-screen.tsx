import type { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

const HERO_TONES = {
  mist: {
    glowPrimary: 'rgba(190, 213, 191, 0.62)',
    glowSecondary: 'rgba(235, 241, 231, 0.98)',
    veil: 'rgba(255, 255, 255, 0.42)',
    curve: 'rgba(236, 244, 235, 0.92)',
  },
  sage: {
    glowPrimary: 'rgba(171, 203, 173, 0.70)',
    glowSecondary: 'rgba(230, 239, 226, 0.98)',
    veil: 'rgba(252, 255, 251, 0.42)',
    curve: 'rgba(231, 241, 229, 0.95)',
  },
  deep: {
    glowPrimary: 'rgba(153, 191, 161, 0.72)',
    glowSecondary: 'rgba(225, 236, 223, 0.95)',
    veil: 'rgba(249, 252, 247, 0.35)',
    curve: 'rgba(223, 237, 223, 0.94)',
  },
} as const;

type AppScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  align?: 'stretch' | 'center';
  justify?: 'flex-start' | 'center';
  tone?: keyof typeof HERO_TONES;
}>;

export function AppScreen({
  children,
  scrollable = false,
  align = 'stretch',
  justify = 'flex-start',
  tone = 'mist',
}: AppScreenProps) {
  const palette = HERO_TONES[tone];
  const content = (
    <View
      style={[
        styles.container,
        align === 'center' && styles.centered,
        justify === 'center' && styles.justifyCenter,
      ]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.topGlowPrimary, { backgroundColor: palette.glowPrimary }]} />
        <View style={[styles.topGlowSecondary, { backgroundColor: palette.glowSecondary }]} />
        <View style={[styles.topVeil, { backgroundColor: palette.veil }]} />
        <View style={[styles.topCurve, { backgroundColor: palette.curve }]} />
      </View>
      {scrollable ? <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F3EC',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlowPrimary: {
    position: 'absolute',
    top: -122,
    right: -54,
    width: 346,
    height: 280,
    borderBottomLeftRadius: 240,
    borderBottomRightRadius: 120,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 240,
  },
  topGlowSecondary: {
    position: 'absolute',
    top: -28,
    left: -42,
    width: 274,
    height: 210,
    borderBottomLeftRadius: 164,
    borderBottomRightRadius: 210,
    borderTopLeftRadius: 174,
    borderTopRightRadius: 154,
  },
  topVeil: {
    position: 'absolute',
    top: 32,
    left: 24,
    right: 24,
    height: 132,
    borderRadius: 40,
  },
  topCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 296,
    borderBottomLeftRadius: 64,
    borderBottomRightRadius: 88,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 20,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
});
