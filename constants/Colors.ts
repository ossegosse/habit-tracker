const tintColorLight = '#1b263b'; // Dark blue accent for light mode
const tintColorDark = '#778da9';  // Lighter blue accent for dark mode

// Category Colors - consistent across both themes
export const categoryColors = {
  Health: '#ef4444',      // Red - for health/medical
  Fitness: '#f97316',     // Orange - for energy/activity
  Productivity: '#10b981', // Green - for growth/achievement
  Learning: '#3b82f6',    // Blue - for knowledge/wisdom
  Social: '#8b5cf6',      // Purple - for relationships/community
  Other: '#6b7280',       // Gray - neutral for miscellaneous
};

export default {
  light: {
    text: '#1b263b',        // Dark text for light background
    authbackground: '#778da9',
    background: '#ffffff',   // Pure white background
    tint: '#1b263b',        // Dark blue accent
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#1e3a8a', // Darker, stronger blue for selected tabs
    header: '#ffffff',      // White header for light mode
    card: '#f8f9fa',        // Very light gray for cards
    cardHeader: '#e9ecef',  // Slightly darker gray for card headers
    border: '#dee2e6',      // Light gray borders
    error: '#dc3545',
    success: '#1b263b',     // Dark blue for success
    warning: '#fd7e14',
    placeholder: '#6c757d',
    inputBackground: '#f8f9fa',
    disabled: '#adb5bd',
    navBackground: '#ffffff',
  },
  dark: {
    text: '#e9ecef',        // Light text for dark background
    authbackground: '#495057',
    background: '#212529',  // Dark background
    tint: tintColorDark,
    tabIconDefault: '#6b7280',
    tabIconSelected: '#1d4ed8', // Darker blue for selected tabs in dark mode
    header: '#343a40',
    card: '#343a40',        // Dark gray for cards
    cardHeader: '#495057',  // Slightly lighter gray for card headers
    border: '#495057',      // Medium gray borders
    error: '#dc3545',
    success: '#778da9',     // Lighter blue for dark mode success
    warning: '#fd7e14',
    placeholder: '#adb5bd',
    inputBackground: '#495057',
    disabled: '#6c757d',
    navBackground: '#343a40',
  },
};