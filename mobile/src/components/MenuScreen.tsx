import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

// each row in the menu; tile is a key into the theme
const MENU_ITEMS = [
  { id: 'forums', title: 'Forums', subtitle: 'Ask other drivers', icon: 'document-text-outline', tile: 'tilePurple' },
  { id: 'about', title: 'About car', subtitle: 'Details and mileage', icon: 'car-sport-outline', tile: 'tileBlue' },
  { id: 'sync', title: 'Sync scanner', subtitle: 'Connect your OBD-II scanner', icon: 'sync-outline', tile: 'tileGreen' },
] as const;

// one tappable row: colored icon tile, title + subtitle, chevron
function MenuRow({ item, onPress }: { item: (typeof MENU_ITEMS)[number]; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.tile, { backgroundColor: theme[item.tile] }]}>
        <Ionicons name={item.icon} size={26} color={theme.text} />
      </View>

      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.text} />
    </Pressable>
  );
}

export default function Menu() {
  const theme = useTheme();

  // TODO: navigate once these pages exist, e.g. router.push('/forums_route')
  const handlePress = (id: string) => {
    console.log('menu item pressed:', id);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Menu</Text>

        {MENU_ITEMS.map((item) => (
          <MenuRow key={item.id} item={item} onPress={() => handlePress(item.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  title: { fontSize: 38, fontWeight: '800', marginTop: 4, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingVertical: 20,
    gap: 16,
  },
  tile: { width: 66, height: 66, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 20, fontWeight: '700' },
  rowSubtitle: { fontSize: 14, marginTop: 2 },
});