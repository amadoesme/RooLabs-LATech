import { Linking, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type Status = 'red' | 'yellow' | 'green';

// fallback text if the API doesn't send its own text
export const STATUS_ADVICE: Record<Status, string> = {
  red: 'Pull over immediately and call for assistance or a tow.',
  yellow: 'Proceed with caution and drive to a mechanic.',
  green: 'You may continue driving, but monitor the issue.',
};

// light -> dark gradient colors for each status
const STATUS_STYLES: Record<Status, { colors: [string, string]; title: string }> = {
  green: { colors: ['#C9EBA8', '#82c652'], title: 'Looks good' },
  yellow: { colors: ['#FFF1A8', '#f5bf2a'], title: 'Needs attention' },
  red: { colors: ['#FFB8B2', '#ed3d33'], title: 'Get help now' },
};

type Props = {
  visible: boolean;
  status: Status;
  message?: string; // advice text shown in the circle
  onDismiss: () => void; // called when the popup is tapped
};

export default function StatusPopup({ visible, status, message, onDismiss }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(width * 0.78, 340);
  const inner = size * 0.82;
  const { colors, title } = STATUS_STYLES[status];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      {/* tapping anywhere on the backdrop dismisses the popup */}
      <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityLabel="Dismiss">
        <LinearGradient
          colors={colors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
        >
          {/* lighter inner ring, like the sketch */}
          <View
            style={{
              position: 'absolute',
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: 'rgba(255,255,255,0.25)',
            }}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message ?? STATUS_ADVICE[status]}</Text>
          <Text style={styles.hint}>Tap to continue</Text>
        </LinearGradient>

        {/* 911 only; its own press doesn't dismiss the popup */}
        <Pressable
          onPress={() => Linking.openURL('tel:911')}
          style={({ pressed }) => [styles.call, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.callText}>911</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    padding: 20,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#14161A', textAlign: 'center' },
  message: { fontSize: 15, lineHeight: 21, color: '#14161A', textAlign: 'center', marginTop: 10 },
  hint: { fontSize: 13, fontWeight: '700', color: '#14161A', marginTop: 16, opacity: 0.8 },
  call: {
    minWidth: 120,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
});