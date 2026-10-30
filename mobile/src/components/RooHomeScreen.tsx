
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Colors the user can choose for their car
const carColors = [
  '#8ACBFA',
  '#DCC0FA',
  '#BDEDD9',
  '#FFE7A1',
  '#FFB5AF',
  '#B7C8E6',
];

export default function RooHomeScreen() {
  // Keeps track of the selected car color
  const [selectedColor, setSelectedColor] = useState(carColors[0]);

  // Temporary actions until the other pages are ready
  const handleButtonPress = (page: string) => {
    const message = `${page} page coming soon!`;

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Roo', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Top buttons */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => handleButtonPress('Emergency contact')}
          >
            <Text style={styles.headerText}>911</Text>
          </Pressable>

          <Pressable
            style={styles.headerButton}
            onPress={() => handleButtonPress('Menu')}
          >
            <Text style={styles.headerText}>☰</Text>
          </Pressable>
        </View>

        {/* Car display */}
        <View style={styles.carSection}>
          <View style={styles.carCircle}>
            <Text style={styles.carIcon}>🚙</Text>
          </View>

          <Text style={styles.carTitle}>My car</Text>

          {/* Car color options */}
          <View style={styles.colorRow}>
            <Text style={styles.customizeText}>Customize</Text>

            {carColors.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select car color ${color}`}
              />
            ))}
          </View>
        </View>

        {/* Emergency button */}
        <Pressable
          style={[styles.featureCard, styles.emergencyCard]}
          onPress={() => handleButtonPress('Emergency')}
        >
          <Text style={styles.featureIcon}>❗</Text>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Emergency</Text>
            <Text style={styles.featureSubtitle}>
              Something's wrong right now
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* Maintenance button */}
        <Pressable
          style={[styles.featureCard, styles.maintenanceCard]}
          onPress={() => handleButtonPress('Maintenance')}
        >
          <Text style={styles.featureIcon}>⚙️</Text>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Maintenance</Text>
            <Text style={styles.featureSubtitle}>
              Last checks and what's due
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the homepage
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 85 : 24,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerButton: {
    backgroundColor: '#DDF0FF',
    padding: 12,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  carSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  carCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#EAF7FF',
    borderWidth: 2,
    borderColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  carIcon: {
    fontSize: 105,
  },
  carTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customizeText: {
    fontSize: 13,
    marginRight: 4,
    color: '#333333',
  },
  colorButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedColor: {
    borderColor: '#222222',
    borderWidth: 3,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
  },
  emergencyCard: {
    backgroundColor: '#FFCAC4',
    borderColor: '#F08075',
  },
  maintenanceCard: {
    backgroundColor: '#D6F5E7',
    borderColor: '#8BCFB0',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#111111',
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#555555',
    marginTop: 4,
  },
  arrow: {
    fontSize: 32,
    color: '#222222',
  },
});
