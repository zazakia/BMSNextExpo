import { supabase } from './supabaseClient';

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface BranchUser {
  id: string;
  userId: string;
  branchId: string;
}

export const createBranch = async (branch: Omit<Branch, 'id'>): Promise<Branch> => {
  const { data, error } = await supabase
    .from('Branch')
    .insert(branch)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateBranch = async (id: string, branch: Partial<Branch>): Promise<Branch> => {
  const { data, error } = await supabase
    .from('Branch')
    .update(branch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteBranch = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Branch')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const getBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase
    .from('Branch')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getBranchById = async (id: string): Promise<Branch | null> => {
  const { data, error } = await supabase
    .from('Branch')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const addUserToBranch = async (userId: string, branchId: string): Promise<BranchUser> => {
  const { data, error } = await supabase
    .from('BranchUser')
    .insert({ userId, branchId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const removeUserFromBranch = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('BranchUser')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const getBranchUsers = async (branchId: string): Promise<BranchUser[]> => {
  const { data, error } = await supabase
    .from('BranchUser')
    .select('*')
    .eq('branchId', branchId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getUserBranches = async (userId: string): Promise<BranchUser[]> => {
  const { data, error } = await supabase
    .from('BranchUser')
    .select('*')
    .eq('userId', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};