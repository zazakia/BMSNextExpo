import { supabase } from './supabaseClient';

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export const createPurchaseOrder = async (
  supplierId: string,
  items: PurchaseItem[]
): Promise<PurchaseOrder> => {
  // Calculate the total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Create the purchase order
  const { data, error } = await supabase
    .from('PurchaseOrder')
    .insert({
      supplierId,
      items,
      totalAmount,
      status: 'DRAFT'
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updatePurchaseOrderStatus = async (
  id: string,
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'
): Promise<PurchaseOrder> => {
  const { data, error } = await supabase
    .from('PurchaseOrder')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const { data, error } = await supabase
    .from('PurchaseOrder')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('Supplier')
    .insert(supplier)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('Supplier')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};