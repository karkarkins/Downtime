import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Activity } from '@/lib/types';
import { useDowntime } from '@/store/store';

export default function LibraryScreen() {
  const activities = useDowntime((s) => s.activities);
  const [showArchived, setShowArchived] = useState(false);

  const active = activities.filter((a) => !a.archived);
  const archived = activities.filter((a) => a.archived);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button
        title="+ Add activity"
        onPress={() => router.push({ pathname: '/activity/[id]', params: { id: 'new' } })}
      />

      {active.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.center}>
          No activities yet. Add the things you&apos;d rather be doing.
        </ThemedText>
      )}
      {active.map((a) => (
        <ActivityRow key={a.id} activity={a} />
      ))}

      {archived.length > 0 && (
        <>
          <Button
            title={showArchived ? 'Hide archived' : `Show archived (${archived.length})`}
            variant="plain"
            onPress={() => setShowArchived((v) => !v)}
          />
          {showArchived && archived.map((a) => <ActivityRow key={a.id} activity={a} />)}
        </>
      )}
    </ScrollView>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/activity/[id]', params: { id: activity.id } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : activity.archived ? 0.5 : 1 })}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedText style={styles.emoji}>{activity.emoji}</ThemedText>
        <View style={styles.flex}>
          <ThemedText>{activity.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {activity.location === 'home' ? 'At home' : 'Anywhere'}
            {activity.archived ? ' · archived' : ''}
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">›</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.two },
  center: { textAlign: 'center', marginTop: Spacing.four },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  emoji: { fontSize: 28, lineHeight: 34 },
  flex: { flex: 1 },
});
