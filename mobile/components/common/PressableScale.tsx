import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  hapticFeedback?: boolean;
}

/**
 * High-performance micro-scale compression component on touch:
 * Scale: 1 -> 0.985 on press in, smoothly returns to 1 on press out.
 * Integrates optional light haptic feedback.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  activeScale = 0.985,
  hapticFeedback = true,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { triggerLight } = useHaptics();

  const handlePressIn = (e: any) => {
    if (!disabled) {
      if (hapticFeedback) {
        triggerLight();
      }
      Animated.timing(scaleAnim, {
        toValue: activeScale,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!disabled) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
    onPressOut?.(e);
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
