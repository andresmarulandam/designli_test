import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, borderRadius } from '../theme/colors';
import { getServerIp, setServerIp } from '../config';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [serverIp, setServerIpLocal] = useState('');
  const [savedIp, setSavedIp] = useState('');

  useEffect(() => {
    const ip = getServerIp();
    setServerIpLocal(ip);
    setSavedIp(ip);
  }, []);

  const handleSaveServerIp = async () => {
    await setServerIp(serverIp);
    setSavedIp(serverIp);
    Alert.alert('Saved', 'Server IP updated. Restart the app to apply changes to WebSocket.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profileCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          <Text style={styles.hint}>
            Enter the IP of the machine running the backend (e.g., 192.168.1.10).
            Use 10.0.2.2 for Android emulator.
          </Text>
          <TextInput
            style={styles.input}
            value={serverIp}
            onChangeText={setServerIpLocal}
            placeholder="Server IP"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            autoCapitalize="none"
          />
          {savedIp !== serverIp && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveServerIp}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.currentIp}>
            Active IP: {savedIp}:3000
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    padding: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  email: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  currentIp: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
