import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { timeAgo } from '@/lib/format';
import type { LogStatus, TriggerSource } from '@/lib/types';
import { useActivityMap, useDowntime } from '@/store/store';

const STATUS_LABEL: Record<LogStatus, string> = {
  started: 'In progress',
  done: 'Done',
  skipped: 'Skipped',
};

const SOURCE_LABEL: Record<TriggerSource, string> = {
  manual: 'rolled',
  'leaving-work': 'after work',
  'arrived-home': 'got home',
  tiktok: 'instead of TikTok',
};

export default function HistoryScreen() {
  const log = useDowntime((s) => s.log);
  const activityMap = useActivityMap();

  const doneCounts = new Map<string, number>();
  for (const e of log) {
    if (e.status === 'done') doneCounts.set(e.activityId, (doneCounts.get(e.activityId) ?? 0) + 1);
  }
  const top = [...doneCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalDone = log.filter((e) => e.status === 'done').length;

  return (
    <FlatList
      data={log}
      keyExtractor={(e) => e.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <ThemedView type="backgroundElement" style={styles.summary}>
          <ThemedText type="subtitle">{totalDone}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {totalDone === 1 ? 'thing done instead of scrolling' : 'things done instead of scrolling'}
          </ThemedText>
          {top.map(([activityId, count]) => {
            const a = activityMap.get(activityId);
            return (
              <View key={activityId} style={styles.row}>
                <ThemedText>
                  {a?.emoji} {a?.name}
                </ThemedText>
                <ThemedText type="smallBold">×{count}</ThemedText>
              </View>
            );
          })}
        </ThemedView>
      }
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Nothing logged yet. Roll an activity to get started.
        </ThemedText>
      }
      renderItem={({ item }) => {
        const a = activityMap.get(item.activityId);
        return (
          <View style={styles.entry}>
            <ThemedText style={styles.emoji}>{a?.emoji ?? '❔'}</ThemedText>
            <View style={styles.flex}>
              <ThemedText>{a?.name ?? 'Deleted activity'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {STATUS_LABEL[item.status]} · {SOURCE_LABEL[item.source]} · {timeAgo(item.rolledAt)}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.three },
  summary: { gap: Spacing.two, padding: Spacing.four, borderRadius: 20, marginBottom: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  center: { textAlign: 'center', marginTop: Spacing.four },
  entry: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  emoji: { fontSize: 26, lineHeight: 32 },
  flex: { flex: 1 },
});
