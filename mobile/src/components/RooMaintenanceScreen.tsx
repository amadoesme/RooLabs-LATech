
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Different health statuses for the vehicle
type HealthStatus = 'Good' | 'Needs Attention' | 'Urgent' | 'Not Checked';

// Information shown for each vehicle system
type MaintenanceItem = {
  id: string;
  name: string;
  status: HealthStatus;
  reason: string;
  source: string;
  action: string;
};

// Sample data for testing the frontend
const initialItems: MaintenanceItem[] = [
  {
    id: 'engine',
    name: 'Engine',
    status: 'Needs Attention',
    reason: 'Misfire issue reported (P0301)',
    source: 'AI Chat / OBD-II code',
    action: 'Schedule a diagnostic inspection.',
  },
  {
    id: 'oil',
    name: 'Oil',
    status: 'Good',
    reason: 'Recent oil change recorded',
    source: 'Maintenance history',
    action: 'Continue regular maintenance.',
  },
  {
    id: 'tires',
    name: 'Tires',
    status: 'Not Checked',
    reason: 'No recent tire inspection',
    source: 'No information available',
    action: 'Add a tire inspection record.',
  },
  {
    id: 'cooling',
    name: 'Fluids / Cooling',
    status: 'Not Checked',
    reason: 'No recent information',
    source: 'No information available',
    action: 'Check fluid levels when safe.',
  },
  {
    id: 'brakes',
    name: 'Brakes',
    status: 'Good',
    reason: 'Brake inspection recorded',
    source: 'Maintenance history',
    action: 'Continue regular inspections.',
  },
  {
    id: 'battery',
    name: 'Battery',
    status: 'Good',
    reason: 'Recent battery check recorded',
    source: 'Maintenance history',
    action: 'Continue monitoring battery health.',
  },
];

// Colors used for each status
const statusColors: Record<HealthStatus, { bg: string; text: string }> = {
  Good: { bg: '#DDF5E9', text: '#236B4C' },
  'Needs Attention': { bg: '#FFF0D4', text: '#8D5C19' },
  Urgent: { bg: '#FFD8D3', text: '#A6372D' },
  'Not Checked': { bg: '#EDF0F4', text: '#596579' },
};

export default function RooMaintenanceScreen() {
  // Stores the maintenance information
  const [items, setItems] = useState<MaintenanceItem[]>(initialItems);

  // Keeps track of which card is open
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Shows a message after clicking a demo button
  const [demoMessage, setDemoMessage] = useState('');

  // Counts the systems that need attention
  const attentionCount = items.filter(
    (item) =>
      item.status === 'Needs Attention' ||
      item.status === 'Urgent'
  ).length;

  // Counts the systems that have not been checked
  const uncheckedCount = items.filter(
    (item) => item.status === 'Not Checked'
  ).length;

  // Counts urgent issues
  const urgentCount = items.filter(
    (item) => item.status === 'Urgent'
  ).length;

  // Opens or closes a maintenance card
  const toggleCard = (id: string) => {
    setExpandedId((current) => current === id ? null : id);
  };

  // Changes the engine status for our demo
  const simulateIssue = () => {
    console.log('Simulate Urgent Issue clicked');

    setItems((current) =>
      current.map((item): MaintenanceItem =>
        item.id === 'engine'
          ? {
              ...item,
              status: 'Urgent',
              reason: 'High engine temperature reported',
              source: 'AI Chat',
              action: 'Stop driving safely and seek assistance.',
            }
          : item
      )
    );

    // Opens the engine card to show the issue
    setExpandedId('engine');

    // Confirms the status changed
    setDemoMessage(
      'Urgent issue simulated! Engine status changed to Urgent.'
    );
  };

  // Resets the sample data
  const resetDemo = () => {
    console.log('Reset Demo clicked');

    setItems(initialItems);
    setExpandedId(null);

    // Confirms the original information was restored
    setDemoMessage('Demo reset! Original maintenance statuses restored.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Page title */}
        <Text style={styles.title}>Maintenance</Text>

        {/* Vehicle health summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {urgentCount > 0
              ? `${urgentCount} urgent ${
                  urgentCount === 1 ? 'issue' : 'issues'
                } detected`
              : attentionCount > 0
                ? `${attentionCount} ${
                    attentionCount === 1
                      ? 'system needs'
                      : 'systems need'
                  } attention`
                : 'No reported issues'}
          </Text>

          <Text style={styles.summaryText}>
            {uncheckedCount}{' '}
            {uncheckedCount === 1 ? 'system' : 'systems'} not checked yet
          </Text>

          <Text style={styles.summaryNote}>
            Based on available maintenance records and reported issues.
          </Text>
        </View>

        {/* Vehicle maintenance categories */}
        {items.map((item) => {
          const colors = statusColors[item.status];
          const isExpanded = expandedId === item.id;

          return (
            <Pressable
              key={item.id}
              style={styles.maintenanceCard}
              onPress={() => toggleCard(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.status}`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {item.name}
                  </Text>

                  <Text style={styles.cardReason}>
                    {item.reason}
                  </Text>
                </View>

                {/* Status label */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colors.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: colors.text },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                {/* Dropdown arrow */}
                <Text style={styles.arrow}>
                  {isExpanded ? '⌃' : '⌄'}
                </Text>
              </View>

              {/* Extra details when the card is opened */}
              {isExpanded && (
                <View style={styles.details}>
                  <Text style={styles.detailText}>
                    Source: {item.source}
                  </Text>

                  <Text style={styles.detailText}>
                    Next step: {item.action}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Temporary buttons for testing status changes */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>
            Frontend Demo Controls
          </Text>

          {/* Simulates an urgent engine issue */}
          <Pressable
            style={styles.demoButton}
            onPress={simulateIssue}
            accessibilityRole="button"
          >
            <Text style={styles.demoButtonText}>
              Simulate Urgent Issue
            </Text>
          </Pressable>

          {/* Resets the maintenance statuses */}
          <Pressable
            style={styles.resetButton}
            onPress={resetDemo}
            accessibilityRole="button"
          >
            <Text style={styles.resetButtonText}>
              Reset Demo
            </Text>
          </Pressable>

          {/* Shows feedback when a button is clicked */}
          {demoMessage !== '' && (
            <View style={styles.messageCard}>
              <Text
                style={styles.messageText}
                accessibilityRole="alert"
              >
                {demoMessage}
              </Text>
            </View>
          )}
        </View>

        {/* Note for testing */}
        <Text style={styles.disclaimer}>
          Sample information for frontend testing only. Not a vehicle diagnosis.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the maintenance page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },

  content: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 85 : 20, // Space below Expo web navbar
    paddingBottom: 50,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#172235',
    marginBottom: 20,
  },

  summaryCard: {
    backgroundColor: '#E7F2FF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#172235',
  },

  summaryText: {
    fontSize: 14,
    color: '#4C6279',
    marginTop: 6,
  },

  summaryNote: {
    fontSize: 12,
    color: '#667085',
    marginTop: 10,
  },

  maintenanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3E7E9',
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  cardInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172235',
  },

  cardReason: {
    fontSize: 12,
    color: '#667085',
    marginTop: 5,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  arrow: {
    fontSize: 22,
    color: '#667085',
    marginLeft: 4,
  },

  details: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 14,
    paddingTop: 12,
    gap: 8,
  },

  detailText: {
    fontSize: 13,
    color: '#344054',
  },

  demoSection: {
    marginTop: 15,
    gap: 10,
  },

  demoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#172235',
  },

  demoButton: {
    backgroundColor: '#F8C8C3',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  demoButtonText: {
    color: '#782C26',
    fontWeight: 'bold',
  },

  resetButton: {
    backgroundColor: '#E7F2FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  resetButtonText: {
    color: '#285D94',
    fontWeight: 'bold',
  },

  messageCard: {
    backgroundColor: '#E8F5EC',
    borderRadius: 12,
    padding: 14,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#B7DFC5',
  },

  messageText: {
    fontSize: 13,
    color: '#236B4C',
    textAlign: 'center',
    fontWeight: '500',
  },

  disclaimer: {
    fontSize: 11,
    color: '#667085',
    marginTop: 20,
    textAlign: 'center',
  },
});
