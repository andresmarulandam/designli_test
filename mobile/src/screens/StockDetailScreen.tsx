import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { finnhubApi } from '../services/api';
import { StockChart } from '../components/StockChart';
import { colors, spacing, borderRadius } from '../theme/colors';
import type { StockQuote } from '../types';

interface StockDetailScreenProps {
  route?: { params: { symbol: string } };
}

export const StockDetailScreen: React.FC<StockDetailScreenProps> = ({ route }) => {
  const symbol = route?.params?.symbol || '';
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [candles, setCandles] = useState<{ price: number; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await finnhubApi.getQuote(symbol);
        setQuote(data);
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  useEffect(() => {
    const interval = setInterval(() => {
      const storedCandles = (window as any).__candles?.[symbol] || [];
      setCandles(storedCandles);
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isPositive = quote ? quote.d >= 0 : true;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        {quote && (
          <View>
            <Text style={styles.price}>
              ${quote.c.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '+' : ''}{quote.d.toFixed(2)} ({isPositive ? '+' : ''}{quote.dp.toFixed(2)}%)
            </Text>
          </View>
        )}
      </View>

      {quote && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Open</Text>
            <Text style={styles.statValue}>${quote.o.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>High</Text>
            <Text style={styles.statValue}>${quote.h.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Low</Text>
            <Text style={styles.statValue}>${quote.l.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Prev Close</Text>
            <Text style={styles.statValue}>${quote.pc.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <StockChart data={candles} symbol={symbol} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  symbol: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  price: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '700',
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  positive: {
    color: colors.primary,
  },
  negative: {
    color: colors.danger,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
