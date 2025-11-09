import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  costPrice: number;
  category: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  lowStockAt: number;
  location: string | null;
}

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('Product')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('InventoryItem')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('Product')
    .insert(product)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('Product')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Product')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const createInventoryItem = async (inventoryItem: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('InventoryItem')
    .insert(inventoryItem)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateInventoryItem = async (id: string, inventoryItem: Partial<InventoryItem>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('InventoryItem')
    .update(inventoryItem)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const adjustInventory = async (id: string, quantityChange: number): Promise<InventoryItem> => {
  // First, get the current inventory item
  const { data: currentItem, error: fetchError } = await supabase
    .from('InventoryItem')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Calculate the new quantity
  const newQuantity = currentItem.quantity + quantityChange;

  // Update with the new quantity
  return updateInventoryItem(id, { quantity: newQuantity });
};