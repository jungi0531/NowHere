import { StyleSheet, Text, View } from 'react-native';

type ScreenIntroProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  size?: 'hero' | 'section';
};

export function ScreenIntro({
  eyebrow,
  title,
  body,
  align = 'left',
  size = 'section',
}: ScreenIntroProps) {
  const centered = align === 'center';
  const hero = size === 'hero';

  return (
    <View style={[styles.container, centered && styles.centered]}>
      {eyebrow ? <Text style={[styles.eyebrow, centered && styles.centerText]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, hero ? styles.heroTitle : styles.sectionTitle, centered && styles.centerText]}>
        {title}
      </Text>
      {body ? (
        <Text style={[styles.body, hero ? styles.heroBody : styles.sectionBody, centered && styles.centerText]}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  centered: {
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6E7B73',
    fontWeight: '700',
  },
  title: {
    fontWeight: '700',
    color: '#1D241E',
  },
  heroTitle: {
    fontSize: 41,
    lineHeight: 50,
    letterSpacing: -0.8,
  },
  sectionTitle: {
    fontSize: 33,
    lineHeight: 42,
    letterSpacing: -0.4,
  },
  body: {
    color: '#526056',
    maxWidth: 360,
  },
  heroBody: {
    fontSize: 17,
    lineHeight: 27,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  centerText: {
    textAlign: 'center',
  },
});
