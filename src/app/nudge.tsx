import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function NudgeScreen() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Got free time?</ThemedText>
      <ThemedText themeColor="textSecondary">Triggered by: {source ?? 'unknown'}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
