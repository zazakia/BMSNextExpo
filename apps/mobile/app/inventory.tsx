import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../src/lib/supabase';

type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  costPrice: number;
  category: string;
  inventories: Array<{
    id: string;
    quantity: number;
    lowStockAt: number;
    location: string | null;
  }>;
};

export default function Inventory() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Product')
        .select(`
          id,
          name,
          description,
          sku,
          price,
          costPrice,
          category,
          inventories (
            id,
            quantity,
            lowStockAt,
            location
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading inventory...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error loading inventory: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Link href="/inventory/add" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const totalQuantity = item.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
          const isLowStock = item.inventories.some(inv => inv.quantity <= inv.lowStockAt);
          
          return (
            <View style={[styles.productCard, isLowStock && styles.lowStockCard]}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSku}>SKU: {item.sku}</Text>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.productInventory}>
                <Text style={styles.inventoryTitle}>Inventory:</Text>
                <Text style={styles.inventoryQuantity}>
                  Total: {totalQuantity} units
                </Text>
                {isLowStock && (
                  <Text style={styles.lowStockText}>Low Stock Alert!</Text>
                )}
              </View>
              <Link href={`/inventory/${item.id}`} asChild>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </Link>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0ea5e9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  addButtonText: {
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  productInventory: {
    marginBottom: 8,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inventoryQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  lowStockText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#0ea5e9',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});