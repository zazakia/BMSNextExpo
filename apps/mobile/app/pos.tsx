import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../src/lib/supabase';

type Product = {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  category: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function POS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('Product')
        .select('id, name, price, costPrice, category')
        .order('name');
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (saleData: {
      totalAmount: number;
      products: Array<{ productId: string; quantity: number; price: number }>;
    }) => {
      const { data, error } = await supabase
        .from('SalesTransaction')
        .insert({
          products: saleData.products,
          totalAmount: saleData.totalAmount,
          paymentType: 'CASH',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCart([]);
      Alert.alert('Success', 'Sale completed successfully');
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to process sale: ${error.message}`);
    }
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      
      return prevCart.filter(item => item.product.id !== productId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processSale = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    const saleData = {
      totalAmount: getCartTotal(),
      products: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };
    
    createSaleMutation.mutate(saleData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.mainContent}>
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Products</Text>
          {isLoading ? (
            <Text>Loading products...</Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.productItem}
                  onPress={() => addToCart(item)}
                >
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No products found</Text>
              }
            />
          )}
        </View>
        
        <View style={styles.cartContainer}>
          <Text style={styles.sectionTitle}>Cart</Text>
          <FlatList
            data={cart}
            keyExtractor={item => item.product.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>${item.product.price.toFixed(2)}</Text>
                </View>
                <View style={styles.cartItemControls}>
                  <TouchableOpacity 
                    style={styles.cartItemButton}
                    onPress={() => removeFromCart(item.product.id)}
                  >
                    <Text style={styles.cartItemButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.cartItemButton}
                    onPress={() => addToCart(item.product)}
                  >
                    <Text style={styles.cartItemButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Cart is empty</Text>
            }
          />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${getCartTotal().toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.checkoutButton, cart.length === 0 && styles.disabledButton]}
            onPress={processSale}
            disabled={cart.length === 0 || isProcessing}
          >
            <Text style={styles.checkoutButtonText}>
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  productsContainer: {
    flex: 1,
    padding: 10,
  },
  cartContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productItem: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  cartItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  cartItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cartItemName: {
    fontSize: 14,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  cartItemControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemButton: {
    width: 30,
    height: 30,
    backgroundColor: '#0ea5e9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItemQuantity: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  checkoutButton: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});