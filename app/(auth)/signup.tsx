import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Shadows } from '../../constants/theme';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Signup Failed', error.message);
      } else {
        Alert.alert(
          'Check Your Email',
          'We sent you a confirmation link. Please verify your email to continue.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDim} />
        </Pressable>

        {/* Header */}
        <View style={styles.headerArea}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start building your idea vault</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={handleSignup}
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <>
                <Text style={styles.signupText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
              </>
            )}
          </Pressable>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 4,
  },
  headerArea: {
    marginBottom: 36,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 15,
    marginTop: 6,
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 4,
    ...Shadows.fab,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  loginLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
});
