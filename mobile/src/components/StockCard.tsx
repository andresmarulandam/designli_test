import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../theme/colors';
import type { Stock } from '../types';

interface StockCardProps {
  stock: Stock;
  currentPrice?: number;
  previousPrice?: number;
  onPress: () => void;
  onRemove?: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  currentPrice,
  previousPrice,
  onPress,
  onRemove,
}) => {
  const priceChange = previousPrice && currentPrice ? currentPrice - previousPrice : 0;
  const priceChangePercent = previousPrice && currentPrice ? ((priceChange / previousPrice) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Text style={styles.removeText}>X</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {currentPrice ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--'}
        </Text>
        {currentPrice && (
          <View style={[styles.changeBadge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
            <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
              {isPositive ? '+' : ''}{priceChangePercent}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  positiveBadge: {
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.primary,
  },
  negativeText: {
    color: colors.danger,
  },
});
