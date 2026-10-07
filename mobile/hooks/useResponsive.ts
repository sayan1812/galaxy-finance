import { useMemo } from 'react';
import { useWindowDimensions, PixelRatio } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { horizontalScale, verticalScale, moderateScale, TYPOGRAPHY } from '../constants/layout';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    // 1080x2340 FHD+ detection (~390-420 pt width, >= 800 pt height)
    const isFHDPlus = height >= 800;
    const isTablet = width >= 600;
    const isSmallPhone = width < 375;

    return {
      width,
      height,
      insets,
      isFHDPlus,
      isTablet,
      isSmallPhone,
      scaleH: (size: number) => horizontalScale(size),
      scaleV: (size: number) => verticalScale(size),
      scaleMod: (size: number, factor?: number) => moderateScale(size, factor),
      typography: TYPOGRAPHY,
      // Usable height excluding top notch and bottom gesture pill
      usableHeight: height - insets.top - insets.bottom,
    };
  }, [width, height, insets]);
}
