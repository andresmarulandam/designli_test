import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { finnhubApi } from '../services/api';
import { connectWebSocket, addPriceListener, subscribeToSymbol } from '../services/websocket';
import { StockCard } from '../components/StockCard';
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
  const [stocks, setStocks] = useState<MarketStock[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchPopular = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await finnhubApi.getPopular();
      setStocks(data);
      data.forEach((s: MarketStock) => subscribeToSymbol(s.symbol));
    } catch (error) {
      console.error('Failed to fetch popular stocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopular();
    connectWebSocket();

    const unsubscribe = addPriceListener((data: { symbol: string; price: number }) => {
      setPrices((prev) => ({ ...prev, [data.symbol]: data.price }));
    });

    return () => {
      unsubscribe();
    };
  }, [fetchPopular]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const { data } = await finnhubApi.search(searchQuery);
        setSearchResults((data.result || []).filter((r: any) => r.type === 'Common Stock' || r.type === 'ETF'));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleStockPress = (symbol: string) => {
    navigation.navigate('StockDetail', { symbol });
  };

  const currentPriceFor = (symbol: string, quoteC: number) =>
    prices[symbol] || quoteC;

  const renderStock = ({ item }: { item: MarketStock }) => (
    <StockCard
      stock={{ _id: item.symbol, symbol: item.symbol, userId: '' }}
      currentPrice={currentPriceFor(item.symbol, item.c)}
      previousPrice={item.pc}
      onPress={() => handleStockPress(item.symbol)}
    />
  );

  const renderSearchResult = ({ item }: { item: any }) => (
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
        <Text style={styles.searchDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <Text style={styles.searchType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Stocks</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search stocks..."
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
          {searching && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchSpinner} />
          )}
        </View>

        {searchQuery.trim().length >= 2 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.symbol}
            renderItem={renderSearchResult}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              !searching ? (
                <Text style={styles.emptyText}>No results found</Text>
              ) : null
            }
          />
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={stocks}
            keyExtractor={(item) => item.symbol}
            renderItem={renderStock}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Popular Stocks</Text>
            }
          />
        )}
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
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.md,
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
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  searchType: {
    color: colors.textSecondary,
    fontSize: 11,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
});
