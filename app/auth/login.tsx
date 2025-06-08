import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text, TextInput, TouchableOpacity, Alert, Image, ScrollView, } from 'react-native';
import { loginUser } from "@/services/firestore/auth-service";
import Colors from '@/constants/Colors';
import { useColorScheme } from "@/components/useColorScheme";
import { createAuthStyles } from '@/constants/AuthStyles';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createAuthStyles(themeColors);

    const handleLogin = async () => {
        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            Alert.alert('Error', emailValidation.error);
            return;
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            Alert.alert('Error', passwordValidation.error);
            return;
        }

        setIsLoading(true);
        try {
            await loginUser(email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

return (
    <ScrollView style={styles.container}>
      <Image style={styles.logo} source={require('@/assets/images/habittracker.png')} />
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Submit'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => router.push('/auth/register')}
      >
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

