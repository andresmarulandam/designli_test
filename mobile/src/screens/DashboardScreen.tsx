import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { finnhubApi } from '../services/api';
import { subscribeToSymbol } from '../services/websocket';
import { useStockStore } from '../store/stockStore';
import { StockCard } from '../components/StockCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius } from '../theme/colors';

interface MarketStock {
  symbol: string;
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
}

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { stocks: userStocks, prices, fetchStocks, addStock, removeStock, startRealTimeUpdates, stopRealTimeUpdates } = useStockStore();
  const [popular, setPopular] = useState<MarketStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchStocks(),
        finnhubApi.getPopular().then(({ data }) => {
          if (Array.isArray(data)) {
            setPopular(data);
            data.forEach((p: MarketStock) => subscribeToSymbol(p.symbol));
          }
        }).catch(() => {}),
      ]);
      startRealTimeUpdates();
      setLoading(false);
    };
    init();

    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const { data } = await finnhubApi.search(searchQuery);
        setSearchResults((data.result || []).filter(
          (r: any) => r.type === 'Common Stock' || r.type === 'ETF' || r.symbol.includes(':'),
        ));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleAddStock = async () => {
    if (!newSymbol.trim()) return;
    try {
      await addStock(newSymbol.trim().toUpperCase());
      setNewSymbol('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock. It may already exist.');
    }
  };

  const handleStockPress = (symbol: string) => {
    navigation.navigate('StockDetail', { symbol });
  };

  const currentPriceFor = (symbol: string, fallback?: number) =>
    prices[symbol] || fallback;

  const allItems = useMemo(() => {
    type Item = { key: string; kind: 'header' | 'user' | 'popular' | 'search'; symbol?: string; price?: number; prevClose?: number; description?: string };
    const items: Item[] = [];

    const added = new Set<string>();

    if (userStocks.length > 0) {
      items.push({ key: 'h-user', kind: 'header', symbol: 'My Stocks' });

      for (const s of userStocks) {
        const m = popular.find((p) => p.symbol === s.symbol);
        items.push({
          key: `user-${s._id}`,
          kind: 'user',
          symbol: s.symbol,
          price: currentPriceFor(s.symbol, m?.c),
          prevClose: m?.pc,
        });
        added.add(s.symbol);
      }
    }

    const extraPopular = popular.filter((p) => !added.has(p.symbol));
    if (extraPopular.length > 0) {
      items.push({ key: 'h-pop', kind: 'header', symbol: 'Popular Stocks' });

      for (const p of extraPopular) {
        items.push({
          key: `pop-${p.symbol}`,
          kind: 'popular',
          symbol: p.symbol,
          price: currentPriceFor(p.symbol, p.c),
          prevClose: p.pc,
        });
        added.add(p.symbol);
      }
    }

    const q = searchQuery.trim().toUpperCase();
    if (q.length >= 2) {
      const known = new Set(items.map((i) => i.symbol));
      const extraSearch = searchResults.filter((r) => !known.has(r.symbol));
      if (extraSearch.length > 0) {
        items.push({ key: 'h-search', kind: 'header', symbol: 'Search Results' });

        for (const r of extraSearch) {
          items.push({
            key: `search-${r.symbol}`,
            kind: 'search',
            symbol: r.symbol,
            description: r.description,
          });
        }
      }
    }

    if (q) {
      return items.filter((i) => i.kind !== 'header' && i.symbol && i.symbol.includes(q));
    }

    return items;
  }, [userStocks, popular, prices, searchResults, searchQuery]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.kind === 'header') {
      return <Text style={styles.sectionTitle}>{item.symbol}</Text>;
    }
    if (item.kind === 'search') {
      return (
        <TouchableOpacity
          style={styles.searchResult}
          onPress={() => {
            setSearchQuery('');
            setSearchResults([]);
            handleStockPress(item.symbol);
          }}
        >
          <View>
            <Text style={styles.searchSymbol}>{item.symbol}</Text>
            {item.description && (
              <Text style={styles.searchDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <StockCard
        stock={{ _id: item.symbol, symbol: item.symbol, userId: '' }}
        currentPrice={item.price}
        previousPrice={item.prevClose}
        onPress={() => handleStockPress(item.symbol)}
        onRemove={item.kind === 'user' ? () => {
          const us = userStocks.find((s) => s.symbol === item.symbol);
          if (us) removeStock(us._id);
        } : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Stocks</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Filter stocks..."
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
          {searching && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchSpinner} />
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={allItems}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? 'No stocks match your search' : 'No stocks available. Tap + to add one.'}
              </Text>
            }
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  searchSpinner: {
    marginLeft: spacing.sm,
  },
  list: {
    paddingBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  searchSymbol: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  searchDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
    maxWidth: 200,
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
