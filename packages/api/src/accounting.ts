import { supabase } from './supabaseClient';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId: string | null;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string | null;
  reference: string | null;
  totalDebits: number;
  totalCredits: number;
  accountId: string;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  description: string | null;
  debit: number;
  credit: number;
}

export const createChartOfAccount = async (account: Omit<ChartOfAccount, 'id'>): Promise<ChartOfAccount> => {
  const { data, error } = await supabase
    .from('ChartOfAccount')
    .insert(account)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getChartOfAccounts = async (): Promise<ChartOfAccount[]> => {
  const { data, error } = await supabase
    .from('ChartOfAccount')
    .select('*')
    .order('code');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createJournalEntry = async (
  entryNumber: string,
  date: Date,
  description: string | null,
  reference: string | null,
  accountId: string,
  lines: Omit<JournalEntryLine, 'id' | 'journalEntryId'>[]
): Promise<JournalEntry> => {
  // Calculate total debits and credits
  const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0);

  // Verify that debits and credits balance
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new Error('Debits and credits must balance');
  }

  // Create the journal entry
  const { data: journalEntry, error: journalError } = await supabase
    .from('JournalEntry')
    .insert({
      entryNumber,
      date,
      description,
      reference,
      totalDebits,
      totalCredits,
      accountId
    })
    .select()
    .single();

  if (journalError) {
    throw new Error(journalError.message);
  }

  // Create the journal entry lines
  const journalEntryId = journalEntry.id;
  const linesToInsert = lines.map(line => ({
    ...line,
    journalEntryId
  }));

  const { data: createdLines, error: linesError } = await supabase
    .from('JournalEntryLine')
    .insert(linesToInsert)
    .select();

  if (linesError) {
    throw new Error(linesError.message);
  }

  // Fetch the complete journal entry with lines
  const { data, error } = await supabase
    .from('JournalEntry')
    .select('*, lines(*)')
    .eq('id', journalEntryId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('JournalEntry')
    .select('*, lines(*)')
    .order('date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getJournalEntryById = async (id: string): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from('JournalEntry')
    .select('*, lines(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTrialBalance = async (date: Date): Promise<{ [accountId: string]: { account: ChartOfAccount; balance: number } }> => {
  // Get all accounts
  const accounts = await getChartOfAccounts();
  
  // Get all journal entries up to the given date
  const { data: journalEntries, error: entriesError } = await supabase
    .from('JournalEntry')
    .select('*, lines(*)')
    .lte('date', date);

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  // Calculate balances
  const balances: { [accountId: string]: { account: ChartOfAccount; balance: number } } = {};

  // Initialize all accounts with zero balance
  accounts.forEach(account => {
    balances[account.id] = {
      account,
      balance: 0
    };
  });

  // Add up debits and credits for each account
  journalEntries?.forEach(entry => {
    entry.lines.forEach((line: JournalEntryLine) => {
      if (balances[line.accountId]) {
        // For assets, expenses, and dividends (left side of balance sheet), debits increase
        // For liabilities, equity, and revenue (right side of balance sheet), credits increase
        const accountType = balances[line.accountId].account.type;
        
        if (['ASSET', 'EXPENSE'].includes(accountType)) {
          balances[line.accountId].balance += line.debit - line.credit;
        } else {
          balances[line.accountId].balance += line.credit - line.debit;
        }
      }
    });
  });

  return balances;
};