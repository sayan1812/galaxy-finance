import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../store/ThemeContext';

interface AnimatedNumberProps {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  prefix = '₹',
  duration = 800
}) => {
  const { reduceMotion } = useTheme();
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    const startVal = startValueRef.current;
    const targetVal = value;
    if (startVal === targetVal) return;

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
        startValueRef.current = targetVal;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, reduceMotion]);

  return (
    <Text style={style}>
      {formatCurrency(displayValue)}
    </Text>
  );
};
