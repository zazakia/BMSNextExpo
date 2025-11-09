import { supabase } from './supabaseClient';
import { getExpenses } from './expenseTracking';
import { generateSalesReport, generateInventoryReport } from './reporting';
import { getBranches } from './branchManagement';

export interface BranchFinancialReport {
  branchId: string;
  branchName: string;
  sales: number;
  expenses: number;
  netIncome: number;
  inventoryValue: number;
  profitMargin: number;
}

export interface InventoryTurnoverReport {
  productId: string;
  productName: string;
  category: string;
  averageInventory: number;
  costOfGoodsSold: number;
  turnoverRatio: number;
  daysToSell: number;
}

export const generateBranchFinancialReport = async (startDate: Date, endDate: Date): Promise<BranchFinancialReport[]> => {
  // Get all branches
  const branches = await getBranches();
  const reports: BranchFinancialReport[] = [];

  for (const branch of branches) {
    // Get sales for the branch
    const { data: sales, error: salesError } = await supabase
      .from('SalesTransaction')
      .select('totalAmount')
      .eq('branchId', branch.id)
      .gte('createdAt', startDate.toISOString())
      .lte('createdAt', endDate.toISOString());

    if (salesError) {
      throw new Error(salesError.message);
    }

    // Calculate total sales
    const totalSales = sales?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;

    // Get expenses for the branch
    const expenses = await getExpenses(branch.id);
    const branchExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate net income
    const netIncome = totalSales - branchExpenses;

    // Get inventory value for the branch
    const { data: branchInventory, error: inventoryError } = await supabase
      .from('BranchInventory')
      .select('quantity, product:productId(costPrice)')
      .eq('branchId', branch.id);

    if (inventoryError) {
      throw new Error(inventoryError.message);
    }

    const inventoryValue = branchInventory?.reduce((sum, item) => {
      return sum + (item.quantity * (item.product?.costPrice || 0));
    }, 0) || 0;

    // Calculate profit margin
    const profitMargin = totalSales > 0 ? (netIncome / totalSales) * 100 : 0;

    reports.push({
      branchId: branch.id,
      branchName: branch.name,
      sales: totalSales,
      expenses: branchExpenses,
      netIncome,
      inventoryValue,
      profitMargin
    });
  }

  return reports;
};

export const generateInventoryTurnoverReport = async (startDate: Date, endDate: Date): Promise<InventoryTurnoverReport[]> => {
  // Get all products
  const { data: products, error: productError } = await supabase
    .from('Product')
    .select('*');

  if (productError) {
    throw new Error(productError.message);
  }

  const reports: InventoryTurnoverReport[] = [];

  for (const product of products || []) {
    // Get inventory for this product
    const { data: inventory, error: inventoryError } = await supabase
      .from('BranchInventory')
      .select('quantity, branch:branchId(name)')
      .eq('productId', product.id);

    if (inventoryError) {
      throw new Error(inventoryError.message);
    }

    // Calculate average inventory
    const totalInventory = inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const numberOfBranches = inventory?.length || 1;
    const averageInventory = totalInventory / numberOfBranches;

    // Get sales of this product in the date range
    const { data: sales, error: salesError } = await supabase
      .from('SalesTransaction')
      .select('products')
      .gte('createdAt', startDate.toISOString())
      .lte('createdAt', endDate.toISOString());

    if (salesError) {
      throw new Error(salesError.message);
    }

    // Calculate cost of goods sold
    let costOfGoodsSold = 0;
    sales?.forEach(sale => {
      const saleItems = sale.products as { productId: string; quantity: number; price: number }[];
      saleItems.forEach(item => {
        if (item.productId === product.id) {
          costOfGoodsSold += item.quantity * product.costPrice;
        }
      });
    });

    // Calculate turnover ratio
    const turnoverRatio = averageInventory > 0 ? costOfGoodsSold / averageInventory : 0;

    // Calculate days to sell
    const daysToSell = turnoverRatio > 0 ? 365 / turnoverRatio : 0;

    reports.push({
      productId: product.id,
      productName: product.name,
      category: product.category,
      averageInventory,
      costOfGoodsSold,
      turnoverRatio,
      daysToSell
    });
  }

  return reports;
};

export const generateCashFlowReport = async (startDate: Date, endDate: Date): Promise<{
  beginningBalance: number;
  cashInflow: number;
  cashOutflow: number;
  endingBalance: number;
  netChange: number;
}> => {
  // Get all sales (cash inflow)
  const { data: sales, error: salesError } = await supabase
    .from('SalesTransaction')
    .select('totalAmount, paymentType, createdAt')
    .gte('createdAt', startDate.toISOString())
    .lte('createdAt', endDate.toISOString());

  if (salesError) {
    throw new Error(salesError.message);
  }

  // Calculate cash inflow from sales
  const cashInflow = sales?.reduce((sum, sale) => {
    // Only count cash sales as cash inflow
    if (sale.paymentType === 'CASH') {
      return sum + sale.totalAmount;
    }
    return sum;
  }, 0) || 0;

  // Get all expenses (cash outflow)
  const { data: expenses, error: expensesError } = await supabase
    .from('Expense')
    .select('amount, date')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  if (expensesError) {
    throw new Error(expensesError.message);
  }

  // Calculate cash outflow from expenses
  const cashOutflow = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  // Calculate net change
  const netChange = cashInflow - cashOutflow;

  // Calculate ending balance (would typically come from a cash account balance)
  // This is a placeholder implementation
  const beginningBalance = 0; // Would be fetched from a cash account
  const endingBalance = beginningBalance + netChange;

  return {
    beginningBalance,
    cashInflow,
    cashOutflow,
    endingBalance,
    netChange
  };
};