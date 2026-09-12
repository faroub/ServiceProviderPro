import { useWindowDimensions } from "react-native";

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmall: boolean;       // < 360px (e.g. iPhone SE 1st gen, small Android)
  isCompact: boolean;     // < 400px (standard compact smartphones)
  isTablet: boolean;      // >= 768px (iPads, Android tablets, foldables)
  isDesktop: boolean;     // >= 1024px (desktop web browsers)
  gutter: number;         // Safe horizontal padding: 12 (small), 16 (normal), 24 (tablet)
  maxContentWidth: number | undefined; // 800px on tablet/desktop, undefined on phone
}

/**
 * Hook providing reactive layout breakpoints and dimension helpers
 * for adapting screens across small smartphones (<360px), normal phones,
 * and large screens (tablets & desktop web).
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isSmall = width < 360;
  const isCompact = width < 400;
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const gutter = isSmall ? 12 : isTablet ? 24 : 16;
  const maxContentWidth = isTablet ? 840 : undefined;

  return {
    width,
    height,
    isSmall,
    isCompact,
    isTablet,
    isDesktop,
    gutter,
    maxContentWidth,
  };
}
