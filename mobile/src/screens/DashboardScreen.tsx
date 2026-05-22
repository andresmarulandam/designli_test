import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { useStockStore } from '../store/stockStore';
import { StockCard } from '../components/StockCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius } from '../theme/colors';
import type { StockPrice } from '../types';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { stocks, prices, fetchStocks, addStock, removeStock, startRealTimeUpdates, stopRealTimeUpdates } = useStockStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStocks();
    startRealTimeUpdates();

    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  useEffect(() => {
    const handlePriceUpdate = (data: StockPrice) => {
      setPreviousPrices((prev) => ({
        ...prev,
        [data.symbol]: prev[data.symbol] || prices[data.symbol] || data.price,
      }));
    };

    return () => {};
  }, [prices]);

  const handleAddStock = async () => {
    if (!newSymbol.trim()) return;
    try {
      await addStock(newSymbol.trim());
      setNewSymbol('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock. It may already exist.');
    }
  };

  const handleStockPress = (symbol: string) => {
    navigation.navigate('StockDetail', { symbol });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No stocks yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first stock</Text>
        </View>
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <StockCard
              stock={item}
              currentPrice={prices[item.symbol]}
              previousPrice={previousPrices[item.symbol]}
              onPress={() => handleStockPress(item.symbol)}
              onRemove={() => removeStock(item._id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            <Input
              label="Symbol"
              value={newSymbol}
              onChangeText={setNewSymbol}
              placeholder="e.g. AAPL, BINANCE:BTCUSDT"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" />
              <Button title="Add" onPress={handleAddStock} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    paddingBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
