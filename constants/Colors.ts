const tintColorLight = '#25532a'; // Much darker green accent for light mode
const tintColorDark = '#13351a';  // Even darker green accent for dark mode

export default {
  light: {
    text: '#142116',
    background: '#dbe5dd',
    tint: tintColorLight,
    tabIconDefault: '#7ca98b',
    tabIconSelected: tintColorLight,
    header: '#a3c9a8',
    card: '#b7cab3',
    border: '#25532a',
    error: '#d90429',
    success: '#25532a',
    warning: '#ffb703',
    placeholder: '#6c757d',
    inputBackground: '#f5f7f6',
    disabled: '#bdbdbd',
    navBackground: '#a3c9a8',
  },
  dark: {
    text: '#b7cab3',
    background: '#142116',
    tint: tintColorDark,
    tabIconDefault: '#25532a',
    tabIconSelected: tintColorDark,
    header: '#18351e',
    card: '#1e2d22',
    border: '#25532a',
    error: '#ff6f61',
    success: '#388e3c',
    warning: '#ffd166',
    placeholder: '#7ca98b',
    inputBackground: '#18351e',
    disabled: '#495057',
    navBackground: '#18351e',
  },
};