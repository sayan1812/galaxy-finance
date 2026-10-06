import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../store/ThemeContext';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { radius, spacing, typography } from '../theme';
import { NotificationItem } from '../types';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('[Notifications] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    await api.markNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Alerts & Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.markReadText, { color: colors.primary }]}>Mark Read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            let iconName: any = 'notifications-outline';
            let iconColor = colors.primary;

            if (item.type === 'budget') {
              iconName = 'pie-chart-outline';
              iconColor = colors.warning;
            } else if (item.type === 'transaction') {
              iconName = 'card-outline';
              iconColor = colors.income;
            } else if (item.type === 'security') {
              iconName = 'shield-checkmark-outline';
              iconColor = colors.secondary;
            }

            return (
              <GlassCard
                style={[
                  styles.notifCard,
                  !item.read && { borderColor: `${iconColor}40` }
                ]}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                  </View>
                  <View style={styles.textWrap}>
                    <View style={styles.topRow}>
                      <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.notifBody, { color: colors.textSecondary }]}>
                      {item.body}
                    </Text>
                    <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                      {item.createdAt?.slice(0, 16).replace('T', ' ')}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Notifications</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                Budget alerts, new imported transactions, and security verifications will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1
  },
  backBtn: {
    padding: 4
  },
  title: {
    ...typography.h3,
    fontSize: 17
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700'
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  notifCard: {
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  notifRow: {
    flexDirection: 'row'
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  textWrap: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  notifTitle: {
    ...typography.bodyBold,
    fontSize: 14
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  notifBody: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2
  },
  notifTime: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 6
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xxl
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.md
  },
  emptySub: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4
  }
});
