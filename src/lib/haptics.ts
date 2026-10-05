import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics aren't available on web (used for quick testing on the PC).
const enabled = Platform.OS !== 'web';

export const tick = () => {
  if (enabled) Haptics.selectionAsync().catch(() => {});
};

export const success = () => {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};
