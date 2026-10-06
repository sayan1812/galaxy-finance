import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../store/ThemeContext';
import { useFinance } from '../store/FinanceContext';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { radius, spacing, typography } from '../theme';
import { AiChatMessage } from '../types';

const PROMPT_SUGGESTIONS = [
  'How much did I spend today?',
  'Which bank has the highest balance?',
  'What was my biggest expense this month?',
  'Show my food expenses',
  'How much cash do I have?'
];

export const GalaxyAiScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { refreshData } = useFinance();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Greetings! I am Galaxy AI, your intelligent financial co-pilot. Ask me about spending patterns, vault balances, or expense categories.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [confirmingActionId, setConfirmingActionId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || isTyping) return;

    const userMsg: AiChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInputText('');
    setIsTyping(true);

    try {
      const res = await api.chatAi(textToSend);
      const aiMsg: AiChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: res.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requiresConfirmation: res.requiresConfirmation,
        pendingAction: res.pendingAction
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: err.message || 'Apologies, I encountered a celestial communication delay. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmAction = async (msg: AiChatMessage) => {
    if (!msg.pendingAction || confirmingActionId) return;
    setConfirmingActionId(msg.id);
    try {
      const res = await api.confirmAiAction(msg.pendingAction);
      if (res.success) {
        Alert.alert('Action Committed', res.message || 'Operation executed safely with audit logging.');
        await refreshData();
        // Remove pending status
        setMessages(prev =>
          prev.map(m =>
            m.id === msg.id
              ? { ...m, requiresConfirmation: false, text: m.text + '\n\n✅ [Action Confirmed and Executed]' }
              : m
          )
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action could not be executed.');
    } finally {
      setConfirmingActionId(null);
    }
  };

  const handleDismissAction = (msgId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId
          ? { ...m, requiresConfirmation: false, text: m.text + '\n\n❌ [Action Cancelled by User]' }
          : m
      )
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={[styles.aiDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Galaxy Financial AI</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {PROMPT_SUGGESTIONS.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
                onPress={() => handleSend(prompt)}
              >
                <Ionicons name="sparkles" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Stream */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>
                {!isUser && (
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Ionicons name="planet" size={16} color="#ffffff" />
                  </View>
                )}

                <View style={{ maxWidth: '82%' }}>
                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: colors.primary }]
                        : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]
                    ]}
                  >
                    <Text style={[styles.bubbleText, { color: isUser ? '#ffffff' : colors.textPrimary }]}>
                      {item.text}
                    </Text>

                    {/* Destructive Action Guard Card */}
                    {item.requiresConfirmation && item.pendingAction && (
                      <GlassCard style={styles.confirmationGuardCard}>
                        <View style={styles.guardHeader}>
                          <Ionicons name="warning" size={18} color={colors.warning} style={{ marginRight: 6 }} />
                          <Text style={[styles.guardTitle, { color: colors.warning }]}>
                            CONFIRMATION REQUIRED
                          </Text>
                        </View>
                        <Text style={[styles.guardDesc, { color: colors.textPrimary }]}>
                          {item.pendingAction.description}
                        </Text>
                        <View style={styles.guardActions}>
                          <TouchableOpacity
                            style={[styles.guardBtn, { backgroundColor: colors.expense }]}
                            onPress={() => handleConfirmAction(item)}
                            disabled={confirmingActionId === item.id}
                          >
                            {confirmingActionId === item.id ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <Text style={styles.guardBtnText}>Confirm & Execute</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.guardBtn, { borderColor: colors.borderSubtle, borderWidth: 1 }]}
                            onPress={() => handleDismissAction(item.id)}
                          >
                            <Text style={[styles.guardBtnText, { color: colors.textMuted }]}>Dismiss</Text>
                          </TouchableOpacity>
                        </View>
                      </GlassCard>
                    )}
                  </View>

                  <Text style={[styles.timestamp, { color: colors.textMuted, textAlign: isUser ? 'right' : 'left' }]}>
                    {item.timestamp}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingWrap}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.typingText, { color: colors.textMuted }]}>Galaxy AI is computing...</Text>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.borderSubtle }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
            placeholder="Ask Galaxy AI anything..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.cardSecondary }]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1
  },
  backBtn: {
    padding: 4
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 17
  },
  suggestionsContainer: {
    paddingVertical: 8
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.lg,
    gap: 8
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1
  },
  suggestionText: {
    fontSize: 12
  },
  chatList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: spacing.md
  },
  userRow: {
    justifyContent: 'flex-end'
  },
  aiRow: {
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  userBubble: {
    borderBottomRightRadius: 2
  },
  aiBubble: {
    borderTopLeftRadius: 2,
    borderWidth: 1
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  timestamp: {
    fontSize: 10,
    marginTop: 3,
    marginHorizontal: 4
  },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: spacing.sm,
    marginLeft: 36
  },
  typingText: {
    fontSize: 12
  },
  confirmationGuardCard: {
    marginTop: spacing.md,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    padding: spacing.md
  },
  guardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  guardTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  guardDesc: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm
  },
  guardActions: {
    flexDirection: 'row',
    gap: 8
  },
  guardBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  guardBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: spacing.sm
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
