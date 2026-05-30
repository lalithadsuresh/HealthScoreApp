import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { api } from '../src/api/client';
import { Button, ErrorBanner, Input, LoadingCenter } from '../src/components/ui';
import type { SearchResult } from '../src/types/api';
import { colors } from '../src/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) {
      setError('Enter at least 2 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { results: r } = await api.searchProducts(q);
      setResults(r);
      if (!r.length) setError('No products found. Try a different search.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed. Check your connection and API URL.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Search products', headerShown: true }} />
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.form}>
          <Input
            label="Product name"
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. greek yogurt"
            returnKeyType="search"
            onSubmitEditing={search}
          />
          <Button label="Search Open Food Facts" onPress={search} loading={loading} />
          <ErrorBanner message={error} />
        </View>
        {loading ? (
          <LoadingCenter />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.barcode}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => router.push(`/product/${item.barcode}`)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Text>🍽️</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.brand}>{item.brand}</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              !error ? (
                <Text style={styles.empty}>Search for a product to see results.</Text>
              ) : null
            }
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  form: { padding: 16, paddingBottom: 0 },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 52, height: 52, borderRadius: 8 },
  thumbPlaceholder: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '600', fontSize: 15 },
  brand: { color: colors.muted, fontSize: 13 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 24 },
});
