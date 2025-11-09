import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSale } from './pos';

// Define the structure of offline sales data
export interface OfflineSale {
  id: string; // Unique client-side ID
  userId: string;
  products: any[];
  paymentType: 'CASH' | 'CARD' | 'MIXED';
  totalAmount: number;
  localCreatedAt: string; // When it was created on the device
  syncedAt?: string; // When it was synced to the server
}

// Create a new offline sale and store it locally
export const saveOfflineSale = async (offlineSale: Omit<OfflineSale, 'id' | 'localCreatedAt'>): Promise<OfflineSale> => {
  const id = generateUUID();
  const localCreatedAt = new Date().toISOString();
  
  const sale: OfflineSale = {
    id,
    ...offlineSale,
    localCreatedAt
  };
  
  // Store in AsyncStorage (React Native) or similar for web
  const existingSales = await getOfflineSales();
  existingSales.push(sale);
  await AsyncStorage.setItem('offlineSales', JSON.stringify(existingSales));
  
  return sale;
};

// Get all offline sales
export const getOfflineSales = async (): Promise<OfflineSale[]> => {
  const salesJson = await AsyncStorage.getItem('offlineSales');
  return salesJson ? JSON.parse(salesJson) : [];
};

// Get unsynced sales (those without a syncedAt timestamp)
export const getUnsyncedSales = async (): Promise<OfflineSale[]> => {
  const allSales = await getOfflineSales();
  return allSales.filter(sale => !sale.syncedAt);
};

// Mark a sale as synced
export const markSaleAsSynced = async (id: string): Promise<void> => {
  const allSales = await getOfflineSales();
  const updatedSales = allSales.map(sale => 
    sale.id === id ? { ...sale, syncedAt: new Date().toISOString() } : sale
  );
  await AsyncStorage.setItem('offlineSales', JSON.stringify(updatedSales));
};

// Sync offline sales to the server
export const syncSales = async (): Promise<{success: number, failed: number}> => {
  const unsyncedSales = await getUnsyncedSales();
  let success = 0;
  let failed = 0;
  
  for (const offlineSale of unsyncedSales) {
    try {
      // Create the sale on the server
      await createSale(offlineSale.userId, offlineSale.products, offlineSale.paymentType);
      
      // Mark as synced
      await markSaleAsSynced(offlineSale.id);
      success++;
    } catch (error) {
      console.error('Failed to sync sale:', error);
      failed++;
    }
  }
  
  return { success, failed };
};

// Register a listener for when the app comes back online
export const registerOnlineListener = (callback: () => void) => {
  // In a real app, you would set up event listeners for online/offline events
  // For example, using NetInfo in React Native
  // This is a simplified version
  window.addEventListener('online', callback);
};

// Generate a UUID (simplified version)
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};