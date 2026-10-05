import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Downtime' }} />
        <Stack.Screen name="roll" options={{ title: 'Roll', presentation: 'modal' }} />
        <Stack.Screen name="nudge" options={{ title: '', presentation: 'modal' }} />
        <Stack.Screen name="library" options={{ title: 'Library' }} />
        <Stack.Screen name="activity/[id]" options={{ title: 'Activity' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
      </Stack>
    </ThemeProvider>
  );
}
