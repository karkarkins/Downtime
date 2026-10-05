import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { timeAgo } from '@/lib/format';
import { useActivityMap, useDowntime } from '@/store/store';

export default function HomeScreen() {
  const log = useDowntime((s) => s.log);
  const finishEntry = useDowntime((s) => s.finishEntry);
  const activityMap = useActivityMap();

  const current = log.find((e) => e.status === 'started');
  const currentActivity = current && activityMap.get(current.activityId);
  const recentDone = log.filter((e) => e.status === 'done').slice(0, 5);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {current && currentActivity ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            DOING NOW · started {timeAgo(current.rolledAt)}
          </ThemedText>
          <ThemedText type="subtitle">
            {currentActivity.emoji} {currentActivity.name}
          </ThemedText>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button title="Done ✓" onPress={() => finishEntry(current.id, 'done')} />
            </View>
            <View style={styles.flex}>
              <Button
                title="Didn't do it"
                variant="secondary"
                onPress={() => finishEntry(current.id, 'skipped')}
              />
            </View>
          </View>
        </ThemedView>
      ) : (
        <View style={styles.hero}>
          <ThemedText type="subtitle" style={styles.center}>
            Got some free time?
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            Skip the scroll. Roll something you&apos;d rather be doing.
          </ThemedText>
        </View>
      )}

      <Button
        title="🎲  Roll an activity"
        size="large"
        onPress={() => router.push({ pathname: '/roll', params: { source: 'manual' } })}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Library" variant="secondary" onPress={() => router.push('/library')} />
        </View>
        <View style={styles.flex}>
          <Button title="History" variant="secondary" onPress={() => router.push('/history')} />
        </View>
      </View>

      {recentDone.length > 0 && (
        <View style={styles.recent}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            RECENTLY DONE
          </ThemedText>
          {recentDone.map((e) => {
            const a = activityMap.get(e.activityId);
            return (
              <View key={e.id} style={styles.recentRow}>
                <ThemedText>
                  {a?.emoji} {a?.name ?? 'Deleted activity'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {timeAgo(e.completedAt ?? e.rolledAt)}
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.three },
  hero: { gap: Spacing.two, paddingVertical: Spacing.five },
  center: { textAlign: 'center' },
  card: { gap: Spacing.three, padding: Spacing.four, borderRadius: 20 },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  recent: { gap: Spacing.two, marginTop: Spacing.three },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
