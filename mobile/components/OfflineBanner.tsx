import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/ThemeContext';
import { spacing, typography } from '../theme';

export const OfflineBanner: React.FC = () => {
  const { syncState, offlineQueueCount, syncOfflineQueue } = useFinance();
  const { colors } = useTheme();

  if (syncState === 'online' && offlineQueueCount === 0) {
    return null;
  }

  const isOffline = syncState === 'offline';
  const isSyncing = syncState === 'syncing';

  let bannerBg = 'rgba(245, 158, 11, 0.15)';
  let borderColor = '#f59e0b';
  let iconName: any = 'cloud-offline-outline';
  let message = 'Offline Mode · Transactions stored locally';

  if (isSyncing) {
    bannerBg = 'rgba(56, 189, 248, 0.15)';
    borderColor = '#38bdf8';
    iconName = 'sync-outline';
    message = 'Synchronizing transactions with server...';
  } else if (offlineQueueCount > 0) {
    bannerBg = 'rgba(139, 92, 246, 0.15)';
    borderColor = '#8b5cf6';
    iconName = 'cloud-upload-outline';
    message = `${offlineQueueCount} transaction${offlineQueueCount > 1 ? 's' : ''} queued for sync`;
  }

  return (
    <View style={[styles.container, { backgroundColor: bannerBg, borderColor }]}>
      <View style={styles.left}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={borderColor} style={styles.icon} />
        ) : (
          <Ionicons name={iconName} size={18} color={borderColor} style={styles.icon} />
        )}
        <Text style={[styles.text, { color: colors.textPrimary }]} numberOfLines={1}>
          {message}
        </Text>
      </View>

      {offlineQueueCount > 0 && !isSyncing && (
        <TouchableOpacity
          onPress={() => syncOfflineQueue()}
          style={[styles.syncBtn, { backgroundColor: borderColor }]}
          activeOpacity={0.8}
        >
          <Text style={styles.syncBtnText}>Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm
  },
  icon: {
    marginRight: spacing.xs
  },
  text: {
    ...typography.captionBold,
    flexShrink: 1
  },
  syncBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  }
});
