import { View } from 'react-native';
import { Stack } from 'expo-router';

import Header from '@/components/Header';
import { useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}