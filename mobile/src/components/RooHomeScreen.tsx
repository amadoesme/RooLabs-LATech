import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INK = '#14302E';
const CAR_NAME = 'Toyota Camry 2015'; // shown under "My car"

// swatches under the title; the selection also tints the floor glow under the car
const CAR_COLORS = [
  { name: 'Black', hex: '#14302E' },
  { name: 'Lavender', hex: '#D9C2F5' },
  { name: 'Mint', hex: '#BDEBD5' },
  { name: 'Yellow', hex: '#FFE49C' },
  { name: 'Coral', hex: '#FFB3AB' },
];

// trout-style speckles scattered across the wash
const SPECKLES = [
  { left: '10%', top: 150, color: '#FFD98A' },
  { left: '22%', top: 200, color: '#FFB3AB' },
  { left: '8%', top: 262, color: '#14302E' },
  { left: '30%', top: 120, color: '#FFFFFF' },
  { left: '88%', top: 170, color: '#FFB3AB' },
  { left: '76%', top: 236, color: '#FFD98A' },
  { left: '92%', top: 282, color: '#14302E' },
  { left: '66%', top: 128, color: '#FFFFFF' },
] as const;

type IconName = ComponentProps<typeof Ionicons>['name'];

// big tappable card: gradient fill, icon, title + subtitle, chevron
function ActionCard({
  colors,
  icon,
  title,
  subtitle,
  onPress,
}: {
  colors: readonly [string, string];
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Ionicons name={icon} size={36} color={INK} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={INK} />
      </LinearGradient>
    </Pressable>
  );
}

export default function RooHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(CAR_COLORS[0]);

  return (
    <View style={styles.screen}>
      {/* teal wash fading into cream; sits behind the persistent header */}
      <LinearGradient
        colors={['#6FD3C2', '#A6E6D6', '#FDF0E6', '#FDF0E6']}
        locations={[0, 0.32, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      {SPECKLES.map((s, i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: s.left, top: s.top, width: 5, height: 5, borderRadius: 3, backgroundColor: s.color, opacity: 0.7 }}
        />
      ))}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 68, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* car breaking out of the arch, standing on a soft floor glow */}
        <View style={styles.stage}>
          <View style={[styles.layer, { top: 18, zIndex: 2 }]}>
            <View style={styles.arch} />
          </View>

          <View style={[styles.layer, { top: 150, zIndex: 0 }]}>
            <View
              style={[
                styles.floor,
                { backgroundColor: selected.hex + '24' },
              ]}
            />
          </View>
        </View>

          <View style={[styles.layer, { top: 0, zIndex: 0 }]}>
            <Image
              source={require('../../assets/images/car.png')}
              style={styles.car}
              resizeMode="contain"
              accessibilityLabel="Your car, side view"
            />
          
        </View>
        

        <Text style={styles.title}>My car</Text>
        <Text style={styles.subtitle}>{CAR_NAME}</Text>

        <View style={styles.swatchRow}>
          <Text style={styles.swatchLabel}>Customize</Text>
          {CAR_COLORS.map((c) => {
            const isSelected = c.name === selected.name;
            return (
              <Pressable
                key={c.name}
                onPress={() => setSelected(c)}
                accessibilityRole="button"
                accessibilityLabel={`${c.name} color`}
                accessibilityState={{ selected: isSelected }}
                style={styles.swatchHit}
              >
                <View style={[styles.swatchRing, { borderColor: isSelected ? INK : 'transparent' }]}>
                  <View style={[styles.swatch, { backgroundColor: c.hex }]} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.cards}>
          <ActionCard
            colors={['#FFDCDC', '#FFC4C4']}
            icon="warning-outline"
            title="Chat with Roo"
            subtitle="Something's wrong right now"
            onPress={() => router.push('/chatbot')}
          />
          <ActionCard
            colors={['#DAF6E8', '#BDEBD5']}
            icon="construct-outline"
            title="Maintenance"
            subtitle="Last checks and what's due"
            onPress={() => router.push('/maintenance')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FDF0E6' },
  content: { alignItems: 'center', paddingHorizontal: 20, width: '100%', maxWidth: 520, alignSelf: 'center' },
  stage: { width: '100%', height: 230, position: 'relative' },
  // full-width absolute strip; its child is centered inside it
  layer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  arch: {
    width: 270,
    height: 135,
    borderTopLeftRadius: 135,
    borderTopRightRadius: 135,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: INK,
  },
  floor: { width: 300, height: 52, borderRadius: 26 },
  car: { width: 340, maxWidth: '100%', aspectRatio: 880 / 309, transform: [{ translateY: -150 }]},
  title: { fontSize: 38, fontWeight: '800', color: INK, marginTop: 4 },
  subtitle: { fontSize: 15, color: '#2C4A47', marginTop: 2 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  swatchLabel: { fontSize: 14, color: '#2C4A47', marginRight: 6 },
  swatchHit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  swatchRing: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 24, height: 24, borderRadius: 12 },
  cards: { width: '100%', gap: 16, marginTop: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 22,
    shadowColor: INK,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: INK },
  cardSub: { fontSize: 13, color: '#3F5B58', marginTop: 2 },
});