import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { colors, borderRadius, spacing } from '../theme/colors';

interface StockChartProps {
  data: { price: number; timestamp: string }[];
  symbol: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, symbol }) => {
  const screenWidth = Dimensions.get('window').width;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chart data available yet</Text>
        <Text style={styles.emptySubtext}>Waiting for real-time price updates...</Text>
      </View>
    );
  }

  const prices = data.map((d) => d.price);
  const labels = data.map((d) => {
    const date = new Date(d.timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  const chartData = {
    labels: labels.slice(-20),
    datasets: [
      {
        data: prices.slice(-20),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{symbol} Price History</Text>
      <LineChart
        data={chartData}
        width={screenWidth - spacing.lg * 2}
        height={220}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(139, 143, 163, ${opacity})`,
          style: {
            borderRadius: borderRadius.md,
          },
          propsForDots: {
            r: '3',
            strokeWidth: '2',
            stroke: colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.border,
            strokeWidth: 0.5,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
