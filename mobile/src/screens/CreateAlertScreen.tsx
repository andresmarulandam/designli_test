import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAlertStore } from '../store/alertStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius } from '../theme/colors';

export const CreateAlertScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const { createAlert } = useAlertStore();

  const handleCreate = async () => {
    if (!symbol.trim() || !targetPrice) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      await createAlert(symbol.trim(), price);
      Alert.alert('Success', 'Alert created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create alert');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Price Alert</Text>

        <Input
          label="Stock Symbol"
          value={symbol}
          onChangeText={setSymbol}
          placeholder="e.g. AAPL, BINANCE:BTCUSDT"
          autoCapitalize="characters"
        />

        <Input
          label="Target Price ($)"
          value={targetPrice}
          onChangeText={setTargetPrice}
          placeholder="Enter target price"
          keyboardType="numeric"
        />

        <Button title="Create Alert" onPress={handleCreate} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
});
