import { supabase } from './supabaseClient';

export interface PaymentGateway {
  id: string;
  name: string;
  isActive: boolean;
  config: Record<string, any>;
}

export interface Payment {
  id: string;
  transactionId: string;
  gatewayId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: Date;
  updatedAt: Date;
}

export const getPaymentGateways = async (): Promise<PaymentGateway[]> => {
  const { data, error } = await supabase
    .from('PaymentGateway')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createPaymentGateway = async (gateway: Omit<PaymentGateway, 'id'>): Promise<PaymentGateway> => {
  const { data, error } = await supabase
    .from('PaymentGateway')
    .insert(gateway)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updatePaymentGateway = async (id: string, gateway: Partial<PaymentGateway>): Promise<PaymentGateway> => {
  const { data, error } = await supabase
    .from('PaymentGateway')
    .update(gateway)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deletePaymentGateway = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('PaymentGateway')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const createPayment = async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> => {
  const { data, error } = await supabase
    .from('Payment')
    .insert(payment)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getPaymentById = async (id: string): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updatePaymentStatus = async (id: string, status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'): Promise<Payment> => {
  const { data, error } = await supabase
    .from('Payment')
    .update({ status, updatedAt: new Date() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Mock implementation for payment processing
export const processPayment = async (gatewayId: string, amount: number, paymentDetails: any): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> => {
  // In a real implementation, this would integrate with a payment gateway
  // like Stripe, PayPal, etc. This is a mock implementation.
  
  try {
    // Get the payment gateway
    const { data: gateway, error: gatewayError } = await supabase
      .from('PaymentGateway')
      .select('*')
      .eq('id', gatewayId)
      .eq('isActive', true)
      .single();

    if (gatewayError || !gateway) {
      throw new Error('Payment gateway not found or inactive');
    }

    // Mock payment processing
    // In a real implementation, this would be a call to the payment gateway's API
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const success = Math.random() > 0.1; // 90% success rate for mock

    // Create the payment record
    await createPayment({
      transactionId,
      gatewayId,
      amount,
      status: success ? 'COMPLETED' : 'FAILED'
    });

    return {
      success,
      transactionId: success ? transactionId : undefined,
      error: success ? undefined : 'Payment processing failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};