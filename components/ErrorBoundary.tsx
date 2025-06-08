import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Here you could log to crash analytics service
  }

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback;
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={this.state.error} 
            onRetry={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      return <DefaultErrorFallback onRetry={() => this.setState({ hasError: false, error: undefined })} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ onRetry }: { onRetry: () => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Ionicons name="warning-outline" size={64} color={themeColors.error} />
      <Text style={[styles.title, { color: themeColors.text }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: themeColors.placeholder }]}>
        We apologize for the inconvenience. Please try again.
      </Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: themeColors.tint }]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
