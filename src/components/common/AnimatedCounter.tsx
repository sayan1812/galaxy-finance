import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
  prefix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  formatter,
  className = '',
  prefix = ''
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic formula for organic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const formatted = formatter 
    ? formatter(displayValue) 
    : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span className={`inline-block transition-colors duration-300 ${className}`}>
      {prefix}{formatted}
    </span>
  );
};

export default AnimatedCounter;
