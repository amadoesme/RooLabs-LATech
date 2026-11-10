import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable, //pressable is a component that responds to touch events
  SafeAreaView, //safeareaview renders content inside the viewable area of the screen
  ScrollView,
  StyleSheet,
  Text, //displays text
  TextInput, //displays text input
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

/* symptoms are associated with human senses,
 each one has a description to help users describe the car problem */
const SYMPTOM_CARDS = [
  { id: "see", title: "See", hint: "Warning light, smoke, leak ?", icon: "👁", color: "cardYellow" },
  { id: "smell", title: "Smell", hint: "Gas, burning ?", icon: "〰", color: "cardPurple" },
  { id: "feel", title: "Feel", hint: "Won't start, shaking, pulling ?", icon: "◎", color: "cardGreen" },
  { id: "hear", title: "Hear", hint: "Knocking, squealing, grinding ?", icon: "🔊", color: "cardBlue" },
] as const;

// format of chat between sender (user or bot), text content, and timestamp
type Message = { id: string; from: "user" | "bot"; text: string; time: string };

// beginning of chat
const INITIAL_MESSAGES: Message[] = [
  { id: "1", from: "bot", text: "Hello! How can I help you with your car today?", time: "0:00" },
];

// onPress is triggered when the button is pressed, label is the text on the button
function IconButton({ label, onPress }: { label: string; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.iconButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

// symptom card; color is a key into the theme (cardYellow, cardPurple, ...)
function SymptomCard({ card, onPress }: { card: (typeof SYMPTOM_CARDS)[number]; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme[card.color], borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={styles.cardIcon}>{card.icon}</Text>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
      <Text style={[styles.cardHint, { color: theme.textSecondary }]}>{card.hint}</Text>
    </Pressable>
  );
}

// message bubble for chat, different styling for user and bot messages
function MessageBubble({ message }: { message: Message }) {
  const theme = useTheme();
  const isUser = message.from === "user";
  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: theme.backgroundSelected }
            : { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: theme.backgroundSelected },
        ]}
      >
        <Text style={[styles.bubbleText, { color: theme.text }]}>{message.text}</Text>
      </View>
      <Text style={[styles.time, { color: theme.textSecondary }]}>{message.time}</Text>
    </View>
  );
}

// main chat screen component, manages state of messages and draft input
export default function ChatBot() {
  const theme = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");

  const send = async (text: string) => {
  const trimmed = text.trim();

  if (!trimmed) return;

  setMessages((prev) => [
    ...prev,
    {
      id: String(Date.now()),
      from: "user",
      text: trimmed,
      time: "now"
    }
  ]);

  setDraft("");

  try {
    const response = await fetch(
      "https://roolabs-latech.onrender.com/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed
        })
      }
    );

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now() + 1),
        from: "bot",
        text: data.response,
        time: "now"
      }
    ]);

    await fetch(
      "https://roolabs-latech.onrender.com/maintenance",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          issue: trimmed,
          status: data.status,
          recommendation: data.response
        })
      }
    );
  } catch (error) {
    console.error("Backend connection error:", error);
  }
};

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
  

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>What's going on?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tap a card or describe it in your own words.
          </Text>

          <View style={styles.grid}>
            {SYMPTOM_CARDS.map((card) => (
              <SymptomCard key={card.id} card={card} onPress={() => send(`${card.title}: ${card.hint}`)} />
            ))}
          </View>

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </ScrollView>

        {/* Input bar pinned to the bottom */}
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Describe what's happening..."
            placeholderTextColor={theme.textSecondary}
            returnKeyType="send"
            onSubmitEditing={() => send(draft)}
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
          />
          <Pressable
            onPress={() => send(draft)}
            style={({ pressed }) => [styles.sendButton, { backgroundColor: theme.text, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={{ color: theme.background, fontSize: 18 }}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconButton: { height: 44, minWidth: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, paddingHorizontal: 12 },
  iconButtonText: { fontSize: 16, fontWeight: "700" },
  scroll: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 34, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12, marginBottom: 24 },
  card: { width: "48%", borderRadius: 16, borderWidth: 1, padding: 12 },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  cardHint: { fontSize: 12 },
  bubbleWrap: { marginBottom: 12, maxWidth: "80%" },
  bubbleLeft: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubbleRight: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubble: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleText: { fontSize: 14 },
  time: { fontSize: 10, marginTop: 4 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 },
  input: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16, fontSize: 14 },
  sendButton: { height: 48, width: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
});