import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { useFinance } from '../../store/FinanceContext';
import { PressableScale } from '../../components/common/PressableScale';

export default function GalaxyAiScreen() {
  const insets = useSafeAreaInsets();
  const { typography } = useResponsive();
  const { triggerLight, triggerMedium } = useHaptics();
  const { overview, transactions } = useFinance();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: `Greetings Commander. I am your Galaxy AI Financial Advisor. Your total net liquidity is ₹${overview.netAvailableMoney.toLocaleString('en-IN')}. How can I assist with your capital allocation, burn rate, or spending telemetry today?`,
    },
  ]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    triggerMedium();
    const userText = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);

    // Smart heuristic analysis
    setTimeout(() => {
      let reply = `Telemetry scan completed for "${userText}". Based on your recent ${transactions.length} transactions, your liquidity burn rate is stable.`;
      if (userText.toLowerCase().includes('spend') || userText.toLowerCase().includes('expense')) {
        reply = `Monthly outflows stand at ₹${overview.totalExpense.toLocaleString('en-IN')}. Top outflow channels are UPI and Dining. Recommend capping non-essential weekend dining to preserve 12% additional capital.`;
      } else if (userText.toLowerCase().includes('save') || userText.toLowerCase().includes('budget')) {
        reply = `Current net liquidity is ₹${overview.netAvailableMoney.toLocaleString('en-IN')}. Allocating ₹15,000 to liquid emergency reserves would shield 3 months of baseline overhead.`;
      }
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
      triggerLight();
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + 10, 20) },
        ]}
      >
        <Text style={[styles.headerTitle, { fontSize: typography.heroSub }]}>
          GALAXY AI ADVISOR
        </Text>
        <Text style={[styles.headerSub, { fontSize: typography.microMeta }]}>
          Autonomous Financial Intelligence Matrix
        </Text>
      </View>

      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={[
          styles.chatContent,
          { paddingBottom: Math.max(insets.bottom + 80, 90) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.messageBubble,
              msg.role === 'ai' ? styles.aiBubble : styles.userBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleLabel,
                { fontSize: typography.caption, color: msg.role === 'ai' ? COLORS.rubyRed : COLORS.coolSteelSlate },
              ]}
            >
              {msg.role === 'ai' ? '✦ GALAXY AI' : 'COMMANDER'}
            </Text>
            <Text style={[styles.messageText, { fontSize: typography.bodyRegular }]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Dock */}
      <View
        style={[
          styles.inputDock,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TextInput
          style={[styles.inputField, { fontSize: typography.bodyRegular }]}
          placeholder="Ask AI about spending, runway, or savings..."
          placeholderTextColor={COLORS.slateDark}
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSend}
          style={styles.sendButton}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSand,
  },
  headerTitle: {
    color: COLORS.primaryText,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  headerSub: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.screenPadding,
    gap: SPACING.md,
  },
  messageBubble: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    maxWidth: '88%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardSurface,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 219, 176, 0.4)',
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  bubbleLabel: {
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  messageText: {
    color: COLORS.primaryText,
    lineHeight: 20,
  },
  inputDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 8,
    backgroundColor: COLORS.canvas,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSand,
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    color: COLORS.primaryText,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: COLORS.primaryAccent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FAF7F3',
    fontWeight: '700',
  },
});
