import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { parseSource } from '@/lib/roll';
import type { TriggerSource } from '@/lib/types';

const PROMPTS: Record<TriggerSource, string> = {
  manual: 'Got some free time?',
  'leaving-work': "Heading home. What'll you do with your evening?",
  'arrived-home': "You're home. Got some free time?",
  tiktok: 'About to scroll? Got some free time instead?',
};

/** Opened by deep link (downtime://nudge?source=…) or, later, by tapping a notification. */
export default function NudgeScreen() {
  const source = parseSource(useLocalSearchParams<{ source?: string }>().source);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.hero}>
        <ThemedText style={styles.emoji}>⏸️</ThemedText>
        <ThemedText type="subtitle" style={styles.center}>
          {PROMPTS[source]}
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <Button
          title="I'm free, roll something"
          size="large"
          onPress={() => router.replace({ pathname: '/roll', params: { source } })}
        />
        <Button title="Not now" variant="plain" onPress={() => router.dismissTo('/')} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  emoji: { fontSize: 64, lineHeight: 76 },
  center: { textAlign: 'center' },
  actions: { gap: Spacing.two, paddingBottom: Spacing.three },
});
