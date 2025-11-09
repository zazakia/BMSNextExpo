import { supabase } from './supabaseClient';

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  userId: string;
  products: SaleItem[];
  totalAmount: number;
  paymentType: 'CASH' | 'CARD' | 'MIXED';
  createdAt: string;
}

export const createSale = async (
  userId: string,
  products: SaleItem[],
  paymentType: 'CASH' | 'CARD' | 'MIXED'
): Promise<Sale> => {
  // Calculate the total amount
  const totalAmount = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Create the sale
  const { data: sale, error: saleError } = await supabase
    .from('SalesTransaction')
    .insert({
      userId,
      products,
      totalAmount,
      paymentType
    })
    .select()
    .single();

  if (saleError) {
    throw new Error(saleError.message);
  }

  // Update inventory for each sold item
  for (const item of products) {
    // Get the inventory item for this product
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('InventoryItem')
      .select('*')
      .eq('productId', item.productId)
      .single();

    if (inventoryError) {
      throw new Error(`Failed to get inventory for product ${item.productId}: ${inventoryError.message}`);
    }

    // Calculate the new quantity
    const newQuantity = inventoryItem.quantity - item.quantity;

    // Update the inventory
    const { error: updateError } = await supabase
      .from('InventoryItem')
      .update({ quantity: newQuantity })
      .eq('id', inventoryItem.id);

    if (updateError) {
      throw new Error(`Failed to update inventory for product ${item.productId}: ${updateError.message}`);
    }
  }

  return sale;
};

export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('SalesTransaction')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getSaleById = async (id: string): Promise<Sale | null> => {
  const { data, error } = await supabase
    .from('SalesTransaction')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};