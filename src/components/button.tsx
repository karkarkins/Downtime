import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'plain';
  size?: 'normal' | 'large';
};

export function Button({ title, variant = 'primary', size = 'normal', disabled, ...rest }: Props) {
  const theme = useTheme();
  const background =
    variant === 'primary'
      ? theme.accent
      : variant === 'secondary'
        ? theme.backgroundElement
        : 'transparent';
  const color = variant === 'primary' ? theme.onAccent : variant === 'plain' ? theme.accent : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'large' && styles.large,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
      {...rest}>
      <ThemedText style={[styles.label, size === 'large' && styles.largeLabel, { color }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.three - 4,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { paddingVertical: Spacing.four, borderRadius: 20 },
  label: { fontWeight: 600 },
  largeLabel: { fontSize: 22, lineHeight: 28 },
});
