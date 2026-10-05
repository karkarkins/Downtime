import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as haptics from '@/lib/haptics';
import { eligibleActivities, isHeadedHome, parseSource, pickActivity } from '@/lib/roll';
import type { Activity } from '@/lib/types';
import { useDowntime, useHydrated } from '@/store/store';

// Delays between shuffle frames: fast at first, slowing down like a slot machine.
const FRAME_DELAYS = [60, 60, 60, 70, 80, 90, 110, 130, 160, 200, 250, 320];

export default function RollScreen() {
  const source = parseSource(useLocalSearchParams<{ source?: string }>().source);
  const hydrated = useHydrated();
  const activities = useDowntime((s) => s.activities);
  const atHome = useDowntime((s) => s.atHome);
  const lastPickId = useDowntime((s) => s.lastPickId);
  const setAtHome = useDowntime((s) => s.setAtHome);
  const startActivity = useDowntime((s) => s.startActivity);
  const skipActivity = useDowntime((s) => s.skipActivity);

  const [shown, setShown] = useState<Activity>();
  const [rolling, setRolling] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const candidates = eligibleActivities(activities, { source, atHome });

  function roll(previousId?: string) {
    const final = pickActivity(candidates, previousId);
    if (!final) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRolling(true);

    let elapsed = 0;
    FRAME_DELAYS.forEach((delay, i) => {
      elapsed += delay;
      const isLast = i === FRAME_DELAYS.length - 1;
      timers.current.push(
        setTimeout(() => {
          if (isLast) {
            setShown(final);
            setRolling(false);
            haptics.success();
            scale.value = withSequence(withTiming(1.12, { duration: 120 }), withSpring(1));
          } else {
            setShown(candidates[Math.floor(Math.random() * candidates.length)]);
            haptics.tick();
          }
        }, elapsed),
      );
    });
  }

  // Roll once as soon as saved data has loaded.
  const rolledOnce = useRef(false);
  useEffect(() => {
    if (!hydrated || rolledOnce.current) return;
    rolledOnce.current = true;
    const t = setTimeout(() => roll(lastPickId), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (hydrated && candidates.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.center}>
          Nothing to roll
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {atHome
            ? 'Add some activities to your library first.'
            : 'None of your activities work away from home. Add an "anywhere" one, or switch to Home.'}
        </ThemedText>
        <Button title="Open library" onPress={() => router.replace('/library')} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {!isHeadedHome(source) && (
        <View style={styles.where}>
          <Segmented
            options={[
              { value: 'home', label: "I'm home" },
              { value: 'away', label: "I'm out" },
            ]}
            value={atHome ? 'home' : 'away'}
            onChange={(v) => setAtHome(v === 'home')}
          />
        </View>
      )}

      <View style={styles.stage}>
        <Animated.View style={[styles.card, cardStyle]}>
          <ThemedView type="backgroundElement" style={styles.cardInner}>
            <ThemedText style={styles.emoji}>{shown?.emoji ?? '🎲'}</ThemedText>
            <ThemedText type="subtitle" style={styles.center}>
              {shown?.name ?? 'Rolling…'}
            </ThemedText>
          </ThemedView>
        </Animated.View>
        {!rolling && shown && (
          <ThemedText themeColor="textSecondary">
            {shown.location === 'home' ? 'At home' : 'Anywhere'}
          </ThemedText>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Let's go"
          size="large"
          disabled={rolling || !shown}
          onPress={() => {
            if (!shown) return;
            startActivity(shown.id, source);
            router.dismissTo('/');
          }}
        />
        <Button
          title="Re-roll"
          variant="secondary"
          disabled={rolling || candidates.length < 2}
          onPress={() => roll(shown?.id)}
        />
        <Button
          title="Not this time"
          variant="plain"
          disabled={rolling || !shown}
          onPress={() => {
            if (shown) skipActivity(shown.id, source);
            router.dismissTo('/');
          }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  center: { textAlign: 'center' },
  where: { alignSelf: 'stretch' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  card: { alignSelf: 'stretch' },
  cardInner: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    borderRadius: 28,
  },
  emoji: { fontSize: 72, lineHeight: 88 },
  actions: { gap: Spacing.two, paddingBottom: Spacing.three },
});
