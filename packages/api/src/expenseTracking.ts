import { supabase } from './supabaseClient';

export interface Expense {
  id: string;
  branchId: string;
  category: string;
  amount: number;
  description: string | null;
  date: Date;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
  const { data, error } = await supabase
    .from('Expense')
    .insert(expense)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
  const { data, error } = await supabase
    .from('Expense')
    .update(expense)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Expense')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const getExpenses = async (branchId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('Expense')
    .select('*')
    .eq('branchId', branchId)
    .order('date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getExpenseById = async (id: string): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from('Expense')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getExpensesByCategory = async (branchId: string): Promise<{ [category: string]: number }> => {
  const { data, error } = await supabase
    .from('Expense')
    .select('category, amount')
    .eq('branchId', branchId);

  if (error) {
    throw new Error(error.message);
  }

  const expensesByCategory: { [category: string]: number } = {};
  data?.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += expense.amount;
  });

  return expensesByCategory;
};