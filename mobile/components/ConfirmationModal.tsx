import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { radius, spacing, typography } from '../theme';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.15)' : `${colors.primary}20` }]}>
            <Ionicons
              name={isDestructive ? 'alert-circle' : 'help-circle'}
              size={32}
              color={isDestructive ? colors.expense : colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.borderSubtle }]}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: isDestructive ? colors.expense : colors.primary }
              ]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center'
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelBtn: {
    borderWidth: 1
  },
  cancelText: {
    ...typography.bodyBold
  },
  confirmBtn: {},
  confirmText: {
    ...typography.bodyBold,
    color: '#ffffff'
  }
});
