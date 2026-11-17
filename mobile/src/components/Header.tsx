import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

const INK = '#14302E';
const EMERGENCY_RED = '#D92B26'; // white text on this passes contrast

// one rounded header button
function HeaderButton({
  label,
  onPress,
  bg,
  children,
}: {
  label: string;
  onPress: () => void;
  bg: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

// persistent top bar, rendered once in app/_layout.tsx
export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const isHome = pathname === '/';
  const isMenu = pathname === '/menu';

  const call911 = () => Linking.openURL('tel:911');
  const openMenu = () => router.push('/menu');

  const emergency = (
    <HeaderButton label="Call 911" onPress={call911} bg={EMERGENCY_RED}>
      <Text style={[styles.text, { color: '#FFFFFF' }]}>911</Text>
    </HeaderButton>
  );
  const menu = (
    <HeaderButton label="Menu" onPress={openMenu} bg={isHome ? 'rgba(255,255,255,0.92)' : theme.backgroundElement}>
      <Ionicons name="menu" size={22} color={INK} />
    </HeaderButton>
  );
  const back = (
    <HeaderButton label="Back" onPress={() => router.back()} bg={theme.backgroundElement}>
      <Ionicons name="chevron-back" size={22} color={INK} />
    </HeaderButton>
  );

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + 8 },
        // on home the bar floats over the teal wash; elsewhere it sits above the screen
        isHome ? styles.floating : { backgroundColor: theme.background },
      ]}
    >
      {isHome ? (
        <>
          {emergency}
          {menu}
        </>
      ) : isMenu ? (
        back
      ) : (
        <>
          {back}
          <View style={styles.right}>
            {pathname !== '/maintenance' && emergency}
            {menu}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  floating: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  right: { flexDirection: 'row', gap: 8 },
  button: {
    height: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: INK,
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  text: { fontSize: 16, fontWeight: '800' },
});