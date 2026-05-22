import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../theme/colors';
import type { Alert } from '../types';

interface AlertCardProps {
  alert: Alert;
  onDelete: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{alert.symbol}</Text>
        <View style={[styles.statusBadge, alert.active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, alert.active ? styles.activeText : styles.inactiveText]}>
            {alert.active ? 'Active' : 'Triggered'}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.label}>Target Price</Text>
        <Text style={styles.targetPrice}>
          ${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      {alert.active && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete Alert</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  symbol: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activeBadge: {
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(139, 143, 163, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: colors.primary,
  },
  inactiveText: {
    color: colors.textSecondary,
  },
  details: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  targetPrice: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  deleteText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
