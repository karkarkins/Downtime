import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Downtime</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Phase 1 build is working. Open downtime://nudge?source=test in Safari to test the deep
        link.
      </ThemedText>
      <Link href="/nudge?source=manual">
        <ThemedText type="linkPrimary">Open nudge screen</ThemedText>
      </Link>
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
  center: { textAlign: 'center' },
});
