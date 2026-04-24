import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type SurfaceCardProps = PropsWithChildren<{
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function SurfaceCard({ children, accent = false, style }: SurfaceCardProps) {
  return <View style={[styles.base, accent && styles.accent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255, 252, 247, 0.98)',
    borderRadius: 30,
    padding: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(221, 228, 219, 0.95)',
    shadowColor: '#324134',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  accent: {
    backgroundColor: 'rgba(236, 244, 233, 0.99)',
    borderColor: '#D6E0D1',
  },
});
