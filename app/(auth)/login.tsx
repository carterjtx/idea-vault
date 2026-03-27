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
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { enableDemoMode } from '../../lib/demoMode';
import { Colors, Shadows } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert('Not Configured', 'Supabase is not configured. Use Guest Mode or add your Supabase credentials to .env.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/(tabs)/vault');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    router.replace('/(tabs)/vault');
  };

  const handleDemoMode = async () => {
    await enableDemoMode();
    router.replace('/(tabs)/vault');
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
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Ionicons name="lock-closed" size={36} color={Colors.gold} />
          </View>
          <Text style={styles.logoTitle}>IdeaVault</Text>
          <Text style={styles.logoSubtitle}>Welcome back to your vault</Text>
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
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={handleLogin}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <>
                <Text style={styles.loginText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
              </>
            )}
          </Pressable>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupLabel}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Demo mode */}
        <Pressable onPress={handleDemoMode} style={styles.demoButton}>
          <Ionicons name="play-circle" size={18} color={Colors.gold} />
          <Text style={styles.demoText}>Try Demo Mode</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Explore IdeaVault with sample data — no account or API keys needed.
        </Text>

        {/* Guest mode */}
        <Pressable onPress={handleGuestMode} style={styles.guestButton}>
          <Ionicons name="person-outline" size={18} color={Colors.textDim} />
          <Text style={styles.guestText}>Continue as Guest</Text>
        </Pressable>
        <Text style={styles.guestNote}>Guest mode saves ideas locally only — no sync across devices.</Text>
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
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  logoTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoSubtitle: {
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
  eyeButton: {
    paddingRight: 14,
    paddingVertical: 14,
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  signupLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  signupLink: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold + '15',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  demoText: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  demoNote: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestText: {
    color: Colors.textDim,
    fontSize: 15,
    fontWeight: '600',
  },
  guestNote: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
});
