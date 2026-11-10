/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  
  light: {
    //main color themes
  background: '#FDF9F0',
  text: '#111111',
  textMuted: '#6B6B6B',
  border: '#111111',
  accent: '#8EC5FF',
  backgroundElement: '#DCEBFA',  // light blue buttons (911, menu, back)
  backgroundSelected: '#BFDAF5', // pressed/selected blue
  textSecondary: '#5E6470',  

//card colors 
  cardYellow: '#FDF1C4',  // "See"
  cardPurple: '#EEE7FB',  // "Smell"
  cardGreen:  '#DDF4E4',  // "Feel"
  cardBlue:   '#DCEBFA',  // "Hear"

    // status colors (for the Home and Maintenance screens later)
  danger:  '#FFC9C9',  // Emergency button, "Needs attention"
  warning: '#FFF0B9',  // "1 thing needs attention" banner
  continue: '#CFEFD9',  // Maintenance button, "Good" pills

  // menu icon tiles
  tilePurple: '#DCD3F2',
  tileBlue:   '#C9DDF0',
  tileGreen:  '#BFE3CC',

  }
};


export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
