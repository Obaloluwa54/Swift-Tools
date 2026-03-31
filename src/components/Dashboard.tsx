import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  Package,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ReceiptData, InvoiceData, Expense, Client, Product } from '../types';
import { motion } from 'motion/react';

export default function Dashboard({ onNavigate, plan }: { onNavigate: (view: string) => void, plan: 'Free' | 'Pro' }) {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    receiptCount: 0,
    invoiceCount: 0,
    clientCount: 0,
    productCount: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const receipts: ReceiptData[] = JSON.parse(localStorage.getItem('swifttools_receipts') || '[]');
    const invoices: InvoiceData[] = JSON.parse(localStorage.getItem('swifttools_invoices') || '[]');
    const expenses: Expense[] = JSON.parse(localStorage.getItem('swifttools_expenses') || '[]');
    const clients: Client[] = JSON.parse(localStorage.getItem('swifttools_clients') || '[]');
    const products: Product[] = JSON.parse(localStorage.getItem('swifttools_products') || '[]');

    const totalIncome = [...receipts, ...invoices].reduce((sum, doc) => sum + doc.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    setStats({
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      receiptCount: receipts.length,
      invoiceCount: invoices.length,
      clientCount: clients.length,
      productCount: products.length
    });

    // Prepare monthly data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const monthName = months[monthIdx];
      
      const monthIncome = [...receipts, ...invoices].filter(doc => {
        const d = new Date(doc.date);
        return d.getMonth() === monthIdx;
      }).reduce((sum, doc) => sum + doc.total, 0);

      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === monthIdx;
      }).reduce((sum, e) => sum + e.amount, 0);

      last6Months.push({
        name: monthName,
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      });
    }
    setChartData(last6Months);

    // Category data for expenses
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    const sortedCats = Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    setCategoryData(sortedCats);

  }, []);

  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#52525b', '#27272a', '#09090b'];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / stats.totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-xl">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{data.name}</p>
          <p className="text-lg font-black text-zinc-900">₦{data.value.toLocaleString()}</p>
          <p className="text-xs font-medium text-emerald-600">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const displayedCategories = showAllCategories ? categoryData : categoryData.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Overview</h1>
          <p className="text-zinc-500">Real-time insights into your business performance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
          <CalendarIcon size={16} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600">Last 6 Months</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <ArrowUpRight size={14} />
              12%
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">Total Income</p>
          <h3 className="text-2xl font-bold text-zinc-900">₦{stats.totalIncome.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600">
              <TrendingDown size={24} />
            </div>
            <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
              <ArrowDownRight size={14} />
              8%
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">Total Expenses</p>
          <h3 className="text-2xl font-bold text-zinc-900">₦{stats.totalExpenses.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
              <ArrowUpRight size={14} />
              15%
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">Net Profit</p>
          <h3 className="text-2xl font-bold text-zinc-900">₦{stats.profit.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
              <FileText size={24} />
            </div>
            <div className="text-zinc-400 text-xs font-bold">
              {stats.receiptCount + stats.invoiceCount} Total
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">Documents</p>
          <h3 className="text-2xl font-bold text-zinc-900">{stats.receiptCount + stats.invoiceCount}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-900">Revenue vs Expenses</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-900" />
                <span className="text-xs font-medium text-zinc-500">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
                <span className="text-xs font-medium text-zinc-500">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  tickFormatter={(value) => `₦${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f4f4f5',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#18181b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#e4e4e7" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-900">Expense Breakdown</h3>
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {showAllCategories ? 'Show Top 5' : 'View All'}
            </button>
          </div>
          <div className="h-[250px] w-full relative">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayedCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {displayedCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                <div className="p-4 bg-zinc-50 rounded-full">
                  <DollarSign size={32} />
                </div>
                <p className="text-sm font-medium">No expenses recorded yet</p>
              </div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="mt-6 space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {displayedCategories.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-medium text-zinc-600 truncate max-w-[120px]">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-900">₦{cat.value.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-400">{((cat.value / stats.totalExpenses) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {categoryData.length > 5 && !showAllCategories && (
                <p className="text-[10px] text-center text-zinc-400 pt-2">
                  + {categoryData.length - 5} more categories
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('receipt')}
          className="p-6 bg-zinc-900 text-white rounded-3xl flex items-center justify-between group hover:bg-zinc-800 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <FileText size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold">New Receipt</p>
              <p className="text-xs text-zinc-400">Quick generate & print</p>
            </div>
          </div>
          <ArrowUpRight className="text-zinc-500 group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={() => onNavigate('invoice')}
          className="p-6 bg-white border border-zinc-100 rounded-3xl flex items-center justify-between group hover:border-zinc-900 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-900">
              <FileText size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-900">New Invoice</p>
              <p className="text-xs text-zinc-500">Professional billing</p>
            </div>
          </div>
          <ArrowUpRight className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
        </button>

        <button 
          onClick={() => onNavigate('expenses')}
          className="p-6 bg-white border border-zinc-100 rounded-3xl flex items-center justify-between group hover:border-zinc-900 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-900">
              <DollarSign size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-900">Add Expense</p>
              <p className="text-xs text-zinc-500">Track your spending</p>
            </div>
          </div>
          <ArrowUpRight className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
        </button>
      </div>

      {plan === 'Free' && (
        <div className="mt-8 p-8 bg-zinc-900 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-amber-400" size={20} />
                <h3 className="text-xl font-bold">Unlock Full Business Insights</h3>
              </div>
              <p className="text-zinc-400 max-w-md">
                Get detailed reports, unlimited document generation, and custom branding for your business.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('settings')}
              className="px-8 py-4 bg-white text-zinc-900 rounded-2xl font-bold hover:bg-zinc-100 transition-all flex items-center gap-2"
            >
              Upgrade to Pro
              <ArrowUpRight size={18} />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        </div>
      )}
    </div>
  );
}
