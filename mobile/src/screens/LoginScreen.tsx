import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius } from '../theme/colors';
import { getServerIp, setServerIp } from '../config';
import { initApi } from '../services/api';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [showIpModal, setShowIpModal] = useState(false);
  const [ipInput, setIpInput] = useState('');
  const [serverIp, setServerIpState] = useState('');
  const { login, register, loading } = useAuthStore();

  useEffect(() => {
    const ip = getServerIp();
    setServerIpState(ip);
  }, []);

  const handleSubmit = async () => {
    setError('');
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Connection failed. Check server IP.';
      setError(msg);
    }
  };

  const handleSaveIp = async () => {
    await setServerIp(ipInput);
    await initApi();
    setServerIpState(ipInput);
    setShowIpModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>DesignLI</Text>
            <Text style={styles.subtitle}>Stock Tracker</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title={isRegister ? 'Create Account' : 'Login'}
              onPress={handleSubmit}
              loading={loading}
            />

            <View style={{ height: spacing.sm }} />

            <Button
              title={isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
              onPress={() => { setIsRegister(!isRegister); setError(''); }}
              variant="outline"
            />
          </View>

          <TouchableOpacity onPress={() => { setIpInput(serverIp); setShowIpModal(true); }} style={styles.ipRow}>
            <Text style={styles.ipText}>Server: {serverIp}:3000</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showIpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Server IP</Text>
            <Text style={styles.modalHint}>Enter the IP of the machine running the backend</Text>
            <TextInput
              style={styles.modalInput}
              value={ipInput}
              onChangeText={setIpInput}
              placeholder="e.g. 192.168.1.7"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" variant="outline" onPress={() => setShowIpModal(false)} />
              <View style={{ width: spacing.sm }} />
              <Button title="Save" onPress={handleSaveIp} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ipRow: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  ipText: {
    color: colors.textSecondary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalHint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
  },
});
