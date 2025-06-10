/**
 * Common reusable styles for consistent theming across components.
 * Provides theme-aware style factories for forms, layouts, and UI elements.
 */

import { StyleSheet } from 'react-native';

export const createCommonStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: themeColors.text,
  },
  input: {
    backgroundColor: themeColors.inputBackground,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: themeColors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: themeColors.text,
  },
  sublabel: {
    fontSize: 14,
    color: themeColors.placeholder,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    justifyContent: "space-between" as const,
  },
  categoryButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryButtonSelected: {
    backgroundColor: themeColors.tint,
    borderColor: themeColors.tint,
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  actionButton: {
    position: "absolute" as const,
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: themeColors.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
});
