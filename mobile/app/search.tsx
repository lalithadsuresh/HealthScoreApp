import { useRouter } from 'expo-router';
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
import { Input, LoadingCenter } from '../src/components/ui';
import { useLiveProductSearch } from '../src/hooks/useLiveProductSearch';
import type { SearchResult } from '../src/types/api';
import { colors } from '../src/theme';

export default function SearchScreen() {
  const { query, setQuery, results, loading, error, emptyMessage } = useLiveProductSearch(400);
  const router = useRouter();

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
            placeholder="e.g. gatorade"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.trim().length < 2 ? (
            <Text style={styles.hint}>Type at least 2 characters — results update as you type.</Text>
          ) : null}
          {loading ? <Text style={styles.hint}>Searching…</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!error && emptyMessage ? <Text style={styles.hint}>{emptyMessage}</Text> : null}
        </View>

        {loading && results.length === 0 ? (
          <LoadingCenter />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.barcode}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.trim().length >= 2 && !loading && !error && !emptyMessage ? (
                <Text style={styles.empty}>No results found</Text>
              ) : null
            }
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
                  {item.confidence ? (
                    <Text style={styles.brand}>
                      {item.isUsSold ? 'U.S. · ' : ''}
                      {item.confidence} confidence
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  form: { padding: 16, paddingBottom: 0 },
  hint: { fontSize: 13, color: colors.muted, marginTop: 8 },
  error: { fontSize: 14, color: colors.danger, marginTop: 8 },
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
