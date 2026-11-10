import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

// button for return, 911, and menu
function HeaderButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function tabs() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const isHome = pathname === '/';

  const call911 = () => Linking.openURL('tel:911');
  const openMenu = () => router.push('/menu');

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8, backgroundColor: theme.background }]}>
      {isHome ? (
        // Homepage style 
        <>
          <HeaderButton label="911" onPress={call911} />
          <HeaderButton label="≡" onPress={openMenu} />
        </>
      ) : (
        // Other screens style 
        <>
          <HeaderButton label="‹" onPress={() => router.back()} />
          <View style={styles.right}>
            {pathname !== '/maintenance_route' && (
              <HeaderButton label="911" onPress={call911} />
            )}
            <HeaderButton label="≡" onPress={openMenu} />
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
  right: { flexDirection: 'row', gap: 8 },
  button: {
    height: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});