import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  DollarSign, 
  Tag, 
  Calendar as CalendarIcon,
  ArrowLeft,
  PieChart,
  Filter,
  X
} from 'lucide-react';
import { Expense } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

const CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Supplies',
  'Travel',
  'Software',
  'Taxes',
  'Other'
];

export default function ExpenseTracker({ onBack, onActivity }: { onBack: () => void; onActivity?: (action: string, details: string) => void }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const saved = localStorage.getItem('swifttools_expenses');
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem('swifttools_expenses', JSON.stringify(newExpenses));
  };

  const handleAdd = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: newExpense.description,
      amount: Number(newExpense.amount),
      category: newExpense.category || 'Other',
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };

    const updated = [expense, ...expenses];
    saveExpenses(updated);
    setShowAddModal(false);
    setNewExpense({
      description: '',
      amount: 0,
      category: 'Other',
      date: new Date().toISOString().split('T')[0]
    });
    onActivity?.('Added Expense', `Added expense: ${expense.description} - ₦${expense.amount}`);
  };

  const handleDelete = () => {
    if (!expenseToDelete) return;
    const expense = expenses.find(e => e.id === expenseToDelete);
    const updated = expenses.filter(e => e.id !== expenseToDelete);
    saveExpenses(updated);
    setExpenseToDelete(null);
    if (expense) {
      onActivity?.('Deleted Expense', `Deleted expense: ${expense.description}`);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
          <p className="text-zinc-500">Keep track of your business spending.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500">Total Expenses</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">₦{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <PieChart size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500">Categories</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{new Set(expenses.map(e => e.category)).size}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Filter size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500">Filtered Count</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{filteredExpenses.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm font-medium"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{expense.date}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">{expense.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-zinc-900">
                    ₦{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setExpenseToDelete(expense.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    <DollarSign size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No expenses found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Add New Expense</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    placeholder="e.g. Office Rent"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Amount (₦)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    placeholder="0.00"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-6 bg-zinc-50 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                >
                  Save Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
}
