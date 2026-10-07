import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/layout';
import { useResponsive } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';
import { useFinance } from '../../store/FinanceContext';
import { PressableScale } from '../../components/common/PressableScale';
import type { BankAccount } from '../../types';

export default function BanksScreen() {
  const insets = useSafeAreaInsets();
  const { typography } = useResponsive();
  const { triggerLight, triggerMedium, triggerSuccess } = useHaptics();

  const {
    banks,
    overview,
    isRefreshing,
    refreshData,
    addBank,
    adjustBankBalance,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Savings');
  const [newBalance, setNewBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState('#E53935');

  const planetColors = [
    '#D9A299', // Muted Terracotta
    '#FFDBB0', // Apricot Nude
    '#FFCCB8', // Blush Peach
    '#FFB1B1', // Soft Coral Red
    '#DCC5B2', // Warm Sand
    '#FFFAD3', // Pale Buttercream
  ];

  const handleCreateBank = async () => {
    if (!newBankName.trim()) {
      Alert.alert('Required', 'Please enter bank name.');
      return;
    }

    triggerMedium();
    const parsedBalance = parseFloat(newBalance) || 0;
    try {
      await addBank({
        bankName: newBankName.trim(),
        accountType: newAccountType,
        openingBalance: parsedBalance,
        balance: parsedBalance,
        planetColor: selectedColor,
      });
      triggerSuccess();
      setIsAddModalOpen(false);
      setNewBankName('');
      setNewBalance('');
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 10, 20),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              triggerLight();
              refreshData();
            }}
            tintColor={COLORS.rubyRed}
            colors={[COLORS.rubyRed, COLORS.subsurfaceWine]}
            progressBackgroundColor={COLORS.charcoalCard}
          />
        }
      >
        {/* Screen Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { fontSize: typography.heroSub }]}>
              BANK VAULTS
            </Text>
            <Text style={[styles.headerSub, { fontSize: typography.microMeta }]}>
              Connected Institutional Liquidity Reserves
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerLight();
              setIsAddModalOpen(true);
            }}
            style={styles.addButton}
          >
            <Text style={[styles.addButtonText, { fontSize: typography.bodySmall }]}>
              + Add Vault
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Bank Liquidity Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { fontSize: typography.microMeta }]}>
            TOTAL INSTITUTIONAL BALANCE
          </Text>
          <Text style={[styles.summaryAmount, { fontSize: typography.heroBalance }]}>
            ₹{overview.totalBankBalance.toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.summarySub, { fontSize: typography.microMeta }]}>
            {banks.length} Connected Accounts across commercial banking rails
          </Text>
        </View>

        {/* Bank Cards List */}
        <View style={styles.vaultsList}>
          {banks.map((bank) => (
            <PressableScale
              key={bank.id}
              activeScale={0.985}
              onPress={() => triggerLight()}
              style={styles.vaultCard}
            >
              <View style={styles.vaultCardHeader}>
                <View style={styles.vaultTitleRow}>
                  <View
                    style={[
                      styles.planetSphere,
                      { backgroundColor: bank.planetColor || COLORS.rubyRed },
                    ]}
                  />
                  <View>
                    <Text style={[styles.bankNameText, { fontSize: typography.cardHeader }]}>
                      {bank.bankName}
                    </Text>
                    <Text style={[styles.accountTypeSub, { fontSize: typography.microMeta }]}>
                      {bank.accountType} {bank.nickname ? `• ${bank.nickname}` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.greenDot} />
                  <Text style={[styles.statusPillText, { fontSize: typography.caption }]}>
                    ACTIVE
                  </Text>
                </View>
              </View>

              <View style={styles.vaultCardBody}>
                <Text style={[styles.balanceCaption, { fontSize: typography.microMeta }]}>
                  AVAILABLE BALANCE
                </Text>
                <Text style={[styles.balanceMain, { fontSize: typography.heroSub }]}>
                  ₹{(bank.balance || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </ScrollView>

      {/* Add Bank Vault Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { paddingBottom: Math.max(insets.bottom + 20, 24) },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: typography.cardHeader }]}>
                CONNECT NEW BANK VAULT
              </Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                BANK NAME
              </Text>
              <TextInput
                style={[styles.modalInput, { fontSize: typography.bodyRegular }]}
                placeholder="HDFC Bank, SBI, ICICI..."
                placeholderTextColor={COLORS.slateDark}
                value={newBankName}
                onChangeText={setNewBankName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                OPENING BALANCE (₹)
              </Text>
              <TextInput
                style={[styles.modalInput, { fontSize: typography.bodyRegular }]}
                placeholder="50000"
                placeholderTextColor={COLORS.slateDark}
                value={newBalance}
                onChangeText={setNewBalance}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontSize: typography.microMeta }]}>
                PLANET COLOR NODE
              </Text>
              <View style={styles.colorPillsRow}>
                {planetColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCircleSelected,
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateBank}
              style={styles.modalSubmitButton}
            >
              <Text style={[styles.modalSubmitText, { fontSize: typography.bodyRegular }]}>
                Confirm Vault Connection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: COLORS.primaryText,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  headerSub: {
    color: COLORS.secondaryText,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  addButton: {
    backgroundColor: COLORS.primaryAccent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FAF7F3',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    marginBottom: SPACING.xl,
  },
  summaryLabel: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  summaryAmount: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  summarySub: {
    color: COLORS.secondaryText,
  },
  vaultsList: {
    gap: SPACING.md,
  },
  vaultCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  vaultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  vaultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planetSphere: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  bankNameText: {
    color: COLORS.primaryText,
    fontWeight: '800',
  },
  accountTypeSub: {
    color: COLORS.secondaryText,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217, 162, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryAccent,
  },
  statusPillText: {
    color: COLORS.primaryAccent,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  vaultCardBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSand,
    paddingTop: SPACING.md,
  },
  balanceCaption: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
  },
  balanceMain: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 38, 33, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardSurface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderColor: COLORS.borderSand,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  modalCloseText: {
    color: COLORS.secondaryText,
    fontSize: 18,
    padding: 4,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.secondaryText,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: COLORS.canvas,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSand,
    color: COLORS.primaryText,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  colorPillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: COLORS.primaryText,
    transform: [{ scale: 1.15 }],
  },
  modalSubmitButton: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  modalSubmitText: {
    color: '#FAF7F3',
    fontWeight: '800',
  },
});
