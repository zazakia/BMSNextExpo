import { supabase } from './supabaseClient';
import { getTrialBalance } from './accounting';
import { getSales } from './pos';
import { getInventoryItems } from './inventory';

export interface SalesReport {
  totalSales: number;
  salesByPaymentType: { [key: string]: number };
  salesByDate: { [date: string]: number };
  topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
}

export interface InventoryReport {
  totalValue: number;
  lowStockItems: { productId: string; productName: string; currentQuantity: number; lowStockAt: number }[];
  byCategory: { category: string; value: number }[];
}

export interface ProfitAndLoss {
  revenue: number;
  expenses: number;
  netIncome: number;
  byCategory: { category: string; amount: number }[];
}

export const generateSalesReport = async (startDate: Date, endDate: Date): Promise<SalesReport> => {
  // Get all sales in the date range
  const { data: sales, error } = await supabase
    .from('SalesTransaction')
    .select('*')
    .gte('createdAt', startDate.toISOString())
    .lte('createdAt', endDate.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  // Calculate total sales
  const totalSales = sales?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;

  // Group sales by payment type
  const salesByPaymentType: { [key: string]: number } = {};
  sales?.forEach(sale => {
    if (!salesByPaymentType[sale.paymentType]) {
      salesByPaymentType[sale.paymentType] = 0;
    }
    salesByPaymentType[sale.paymentType] += sale.totalAmount;
  });

  // Group sales by date
  const salesByDate: { [date: string]: number } = {};
  sales?.forEach(sale => {
    const date = new Date(sale.createdAt).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = 0;
    }
    salesByDate[date] += sale.totalAmount;
  });

  // Get top products
  const productSales: { [productId: string]: { productName: string; quantity: number; revenue: number } } = {};
  
  // We'll need to fetch product names
  const { data: products, error: productError } = await supabase
    .from('Product')
    .select('*');

  if (productError) {
    throw new Error(productError.message);
  }

  // Process sales to find top products
  sales?.forEach(sale => {
    const saleItems = sale.products as { productId: string; quantity: number; price: number }[];
    
    saleItems.forEach(item => {
      if (!productSales[item.productId]) {
        const product = products?.find(p => p.id === item.productId);
        productSales[item.productId] = {
          productName: product?.name || 'Unknown Product',
          quantity: 0,
          revenue: 0
        };
      }
      
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.quantity * item.price;
    });
  });

  // Convert to array and sort by revenue
  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => ({
      productId,
      productName: data.productName,
      quantity: data.quantity,
      revenue: data.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10 products

  return {
    totalSales,
    salesByPaymentType,
    salesByDate,
    topProducts
  };
};

export const generateInventoryReport = async (): Promise<InventoryReport> => {
  // Get all inventory items
  const inventoryItems = await getInventoryItems();
  
  // Get all products
  const { data: products, error: productError } = await supabase
    .from('Product')
    .select('*');

  if (productError) {
    throw new Error(productError.message);
  }

  // Calculate total value
  let totalValue = 0;
  const inventoryWithProduct: { 
    productId: string, 
    productName: string, 
    quantity: number, 
    lowStockAt: number, 
    unitPrice: number,
    category: string
  }[] = [];

  // Combine inventory data with product data
  inventoryItems.forEach(item => {
    const product = products?.find(p => p.id === item.productId);
    if (product) {
      const itemValue = item.quantity * product.costPrice;
      totalValue += itemValue;
      
      inventoryWithProduct.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        lowStockAt: item.lowStockAt,
        unitPrice: product.costPrice,
        category: product.category
      });
    }
  });

  // Get low stock items
  const lowStockItems = inventoryWithProduct
    .filter(item => item.quantity <= item.lowStockAt)
    .map(item => ({
      productId: item.productId,
      productName: item.productName,
      currentQuantity: item.quantity,
      lowStockAt: item.lowStockAt
    }));

  // Group by category
  const categoryValue: { [category: string]: number } = {};
  inventoryWithProduct.forEach(item => {
    const itemValue = item.quantity * item.unitPrice;
    
    if (!categoryValue[item.category]) {
      categoryValue[item.category] = 0;
    }
    categoryValue[item.category] += itemValue;
  });

  const byCategory = Object.entries(categoryValue).map(([category, value]) => ({
    category,
    value
  }));

  return {
    totalValue,
    lowStockItems,
    byCategory
  };
};

export const generateProfitAndLoss = async (startDate: Date, endDate: Date): Promise<ProfitAndLoss> => {
  // Get sales data to calculate revenue
  const salesReport = await generateSalesReport(startDate, endDate);
  const revenue = salesReport.totalSales;

  // Get journal entries in the date range for expenses
  const { data: journalEntries, error: journalError } = await supabase
    .from('JournalEntry')
    .select('*, lines(*)')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  if (journalError) {
    throw new Error(journalError.message);
  }

  // Calculate expenses
  let expenses = 0;
  const expensesByCategory: { [category: string]: number } = {};

  // We'll need to get the account types from Chart of Accounts
  const { data: accounts, error: accountError } = await supabase
    .from('ChartOfAccount')
    .select('*');

  if (accountError) {
    throw new Error(accountError.message);
  }

  // Sum up expenses from journal entries
  journalEntries?.forEach(entry => {
    entry.lines.forEach((line: any) => {
      const account = accounts?.find(a => a.id === line.accountId);
      
      if (account?.type === 'EXPENSE') {
        expenses += line.debit; // Expenses are typically debited
        if (!expensesByCategory[account.name]) {
          expensesByCategory[account.name] = 0;
        }
        expensesByCategory[account.name] += line.debit;
      }
    });
  });

  // Calculate net income
  const netIncome = revenue - expenses;

  // Convert to array format
  const byCategory = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount
  }));

  return {
    revenue,
    expenses,
    netIncome,
    byCategory
  };
};