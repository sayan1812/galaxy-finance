import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../store/ThemeContext';
import { radius, spacing } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  borderGlow?: boolean;
  glowColor?: string;
  gradientColors?: [string, string, ...string[]];
  activeOpacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  borderGlow = false,
  glowColor,
  gradientColors,
  activeOpacity = 0.75
}) => {
  const { colors } = useTheme();

  const defaultGradient: [string, string] = [colors.card, colors.card];

  const content = (
    <LinearGradient
      colors={gradientColors || defaultGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderColor: borderGlow
            ? (glowColor || colors.primary)
            : colors.borderSubtle,
          backgroundColor: colors.card
        },
        borderGlow && {
          shadowColor: glowColor || colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4
        },
        style
      ]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden'
  }
});
