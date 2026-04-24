import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

type AppButtonProps = {
  label: string;
  kind?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
} & Omit<ComponentProps<typeof Pressable>, 'children' | 'style'>;

export function AppButton({ label, kind = 'primary', style, ...props }: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        kind === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
      {...props}>
      <Text style={[styles.label, kind === 'primary' ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderWidth: 1,
    shadowColor: '#2A372D',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 7,
  },
  primary: {
    backgroundColor: '#2F4733',
    borderColor: '#2B422F',
  },
  secondary: {
    backgroundColor: 'rgba(252, 248, 242, 0.98)',
    borderColor: '#D8E0D8',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ translateY: 1 }],
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  primaryLabel: {
    color: '#F7F4EE',
  },
  secondaryLabel: {
    color: '#344537',
  },
});
