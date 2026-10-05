import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityLocation } from '@/lib/types';
import { useDowntime } from '@/store/store';

const QUICK_EMOJI = ['🥁', '🎮', '🎸', '🎹', '📖', '✏️', '🎨', '🏃', '🚶', '🧘', '🏋️', '🍳', '🧩', '📞', '🌱', '📷'];

export default function ActivityEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useDowntime((s) => s.activities.find((a) => a.id === id));
  const addActivity = useDowntime((s) => s.addActivity);
  const updateActivity = useDowntime((s) => s.updateActivity);
  const setArchived = useDowntime((s) => s.setArchived);
  const theme = useTheme();

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '✨');
  const [location, setLocation] = useState<ActivityLocation>(existing?.location ?? 'home');

  const isNew = !existing;
  const canSave = name.trim().length > 0;

  function save() {
    const input = { name: name.trim(), emoji: emoji.trim() || '✨', location };
    if (existing) updateActivity(existing.id, input);
    else addActivity(input);
    router.back();
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: isNew ? 'New activity' : 'Edit activity' }} />

      <View style={styles.field}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          NAME
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Play drums"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
          autoFocus={isNew}
          returnKeyType="done"
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          EMOJI
        </ThemedText>
        <View style={styles.emojiRow}>
          <TextInput
            value={emoji}
            onChangeText={(t) => setEmoji(Array.from(t).slice(-2).join(''))}
            style={[inputStyle, styles.emojiInput]}
          />
          <View style={styles.quick}>
            {QUICK_EMOJI.map((e) => (
              <Pressable
                key={e}
                accessibilityRole="button"
                accessibilityLabel={`Use ${e}`}
                onPress={() => setEmoji(e)}
                style={[styles.quickItem, emoji === e && { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={styles.quickEmoji}>{e}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          WHERE CAN YOU DO IT?
        </ThemedText>
        <Segmented
          options={[
            { value: 'home', label: 'At home' },
            { value: 'anywhere', label: 'Anywhere' },
          ]}
          value={location}
          onChange={setLocation}
        />
      </View>

      <Button title={isNew ? 'Add to library' : 'Save'} disabled={!canSave} onPress={save} />
      {existing && (
        <Button
          title={existing.archived ? 'Restore to library' : 'Archive'}
          variant="plain"
          onPress={() => {
            setArchived(existing.id, !existing.archived);
            router.back();
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: { fontSize: 17, padding: Spacing.three, borderRadius: 12 },
  emojiRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  emojiInput: { width: 64, textAlign: 'center', fontSize: 28 },
  quick: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  quickItem: { padding: Spacing.one, borderRadius: 8 },
  quickEmoji: { fontSize: 24, lineHeight: 30 },
});
