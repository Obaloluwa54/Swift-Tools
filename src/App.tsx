import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  Menu, 
  X, 
  Users, 
  Package,
  Clock,
  CheckCircle2,
  Crown,
  Zap,
  AlertTriangle,
  DollarSign,
  Calculator
} from 'lucide-react';
import { Activity, BusinessSettings } from './types';
import { cn } from './utils';
import ReceiptGenerator from './components/ReceiptGenerator';
import InvoiceGenerator from './components/InvoiceGenerator';
import QuoteGenerator from './components/QuoteGenerator';
import TaxCalculator from './components/TaxCalculator';
import SettingsComponent from './components/Settings';
import Clients from './components/Clients';
import Products from './components/Products';
import HelpCenter from './components/HelpCenter';
import ConfirmModal from './components/ConfirmModal';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';

type Tool = 'dashboard' | 'receipt' | 'invoice' | 'settings' | 'clients' | 'products' | 'help' | 'pricing' | 'expenses' | 'quote' | 'tax';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [stats, setStats] = useState({
    invoices: 0,
    receipts: 0,
    clients: 0,
    products: 0
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTool]);

  const loadSettings = () => {
    const saved = localStorage.getItem('swifttools_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    return () => window.removeEventListener('settingsUpdated', loadSettings);
  }, []);

  useEffect(() => {
    const savedActivities = localStorage.getItem('swifttools_activities');
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities) || []);
    }
  }, []);

  useEffect(() => {
    // Load stats
    const clients = JSON.parse(localStorage.getItem('swifttools_clients') || '[]');
    const products = JSON.parse(localStorage.getItem('swifttools_products') || '[]');
    const invoicesCount = activities.filter(a => a.type === 'invoice').length;
    const receiptsCount = activities.filter(a => a.type === 'receipt').length;

    setStats({
      invoices: invoicesCount,
      receipts: receiptsCount,
      clients: clients.length,
      products: products.length
    });
  }, [activities]);

  const logActivity = (type: Activity['type'], action: string, details: string) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, 10);
      localStorage.setItem('swifttools_activities', JSON.stringify(updated));
      return updated;
    });
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('swifttools_activities');
    setShowClearConfirm(false);
  };

  const tools = [
    {
      id: 'receipt' as Tool,
      name: 'Receipt Generator',
      description: 'Create professional receipts for your customers instantly.',
      icon: <Receipt className="w-6 h-6" />,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'invoice' as Tool,
      name: 'Invoice Generator',
      description: 'Generate detailed invoices with tax calculations and due dates.',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'clients' as Tool,
      name: 'Client Manager',
      description: 'Save and manage your recurring customers for quick invoicing.',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'products' as Tool,
      name: 'Product Catalog',
      description: 'Manage your products and services with pre-set pricing.',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'quote' as Tool,
      name: 'Quote Generator',
      description: 'Create professional quotes for your potential clients.',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'tax' as Tool,
      name: 'Tax Calculator',
      description: 'Quickly calculate VAT and other taxes for your business.',
      icon: <Calculator className="w-6 h-6" />,
      color: 'bg-zinc-50 text-zinc-600',
    },
    {
      id: 'expenses' as Tool,
      name: 'Expense Tracker',
      description: 'Keep track of your business spending and categories.',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-red-50 text-red-600',
    }
  ];

  const handleToolSelect = (tool: Tool) => {
    if ((tool === 'receipt' || tool === 'invoice' || tool === 'quote' || tool === 'expenses') && settings?.plan === 'Free') {
      const totalDocs = stats.invoices + stats.receipts + (activities.filter(a => a.type === 'quote').length);
      // Expenses are Pro only
      if (tool === 'expenses') {
        setShowLimitModal(true);
        return;
      }
      if (totalDocs >= 10) {
        setShowLimitModal(true);
        return;
      }
    }
    setActiveTool(tool);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-zinc-900 font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-100 sticky top-0 z-50 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">SwiftTools</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation (Desktop) */}
      <nav className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-100 p-6 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 no-print ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden lg:flex items-center gap-2 mb-12 px-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">SwiftTools</span>
        </div>

        <div className="space-y-2 flex-1 mt-12 lg:mt-0">
          <button 
            onClick={() => handleToolSelect('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTool === 'dashboard' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="pt-8 pb-2 px-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tools</span>
          </div>

          {tools.map((tool) => (
            <button 
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTool === tool.id ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50'}`}
            >
              {tool.id === 'receipt' && <Receipt size={20} />}
              {tool.id === 'invoice' && <FileText size={20} />}
              {tool.id === 'quote' && <FileText size={20} className="rotate-12" />}
              {tool.id === 'tax' && <Calculator size={20} />}
              {tool.id === 'clients' && <Users size={20} />}
              {tool.id === 'products' && <Package size={20} />}
              {tool.id === 'expenses' && <DollarSign size={20} />}
              <span className="font-medium">{tool.name}</span>
              {settings?.plan === 'Free' && (tool.id === 'receipt' || tool.id === 'invoice' || tool.id === 'quote' || tool.id === 'expenses') && (
                <span className="ml-auto text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-bold">
                  {tool.id === 'expenses' ? 'Pro' : 'Free'}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2 pt-6 border-t border-zinc-100">
          {settings?.plan === 'Free' && (
            <button 
              onClick={() => handleToolSelect('settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all mb-2"
            >
              <Crown size={20} />
              <span className="font-bold text-sm">Upgrade to Pro</span>
            </button>
          )}
          <button 
            onClick={() => handleToolSelect('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTool === 'settings' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={() => handleToolSelect('help')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTool === 'help' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <HelpCircle size={20} />
            <span className="font-medium">Help Center</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${activeTool === 'dashboard' ? 'lg:ml-64' : 'lg:ml-64'} min-h-screen`}>
        <AnimatePresence mode="wait">
          {activeTool === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard 
                onNavigate={handleToolSelect} 
                plan={settings?.plan || 'Free'} 
              />
            </motion.div>
          )}

          {activeTool === 'receipt' && (
            <motion.div 
              key="receipt"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ReceiptGenerator 
                onBack={() => setActiveTool('dashboard')} 
                onActivity={(action, details) => logActivity('receipt', action, details)}
              />
            </motion.div>
          )}

          {activeTool === 'invoice' && (
            <motion.div 
              key="invoice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <InvoiceGenerator 
                onBack={() => setActiveTool('dashboard')} 
                onActivity={(action, details) => logActivity('invoice', action, details)}
              />
            </motion.div>
          )}

          {activeTool === 'quote' && (
            <motion.div 
              key="quote"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <QuoteGenerator 
                onBack={() => setActiveTool('dashboard')} 
                onActivity={(action, details) => logActivity('quote', action, details)}
              />
            </motion.div>
          )}

          {activeTool === 'tax' && (
            <motion.div 
              key="tax"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TaxCalculator 
                onBack={() => setActiveTool('dashboard')} 
              />
            </motion.div>
          )}

          {activeTool === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SettingsComponent onBack={() => setActiveTool('dashboard')} />
            </motion.div>
          )}

          {activeTool === 'clients' && (
            <motion.div 
              key="clients"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Clients 
                onBack={() => setActiveTool('dashboard')} 
                onActivity={(action, details) => logActivity('client', action, details)}
              />
            </motion.div>
          )}

          {activeTool === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Products 
                onBack={() => setActiveTool('dashboard')} 
                onActivity={(action, details) => logActivity('product', action, details)}
              />
            </motion.div>
          )}

          {activeTool === 'help' && (
            <motion.div 
              key="help"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HelpCenter onBack={() => setActiveTool('dashboard')} />
            </motion.div>
          )}

          {activeTool === 'expenses' && (
            <motion.div 
              key="expenses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ExpenseTracker 
                onBack={() => setActiveTool('dashboard')} 
                onActivity={(action, details) => logActivity('expense', action, details)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="p-8 border-t border-zinc-100 text-center text-zinc-400 text-sm no-print">
          {settings?.plan === 'Free' ? (
            <p>© {new Date().getFullYear()} SwiftTools. Built with <span className="text-zinc-900 font-bold">Genix</span>.</p>
          ) : (
            <p>© {new Date().getFullYear()} {settings?.businessName || 'SwiftTools'}. All rights reserved.</p>
          )}
        </footer>
      </main>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
      {/* Confirm Modal */}
      <ConfirmModal 
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearActivities}
        title="Clear Activity Log"
        message="Are you sure you want to clear your entire activity log? This action cannot be undone."
        confirmText="Clear Log"
        type="danger"
      />

      {/* Limit Modal */}
      <ConfirmModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onConfirm={() => {
          setShowLimitModal(false);
          setActiveTool('settings');
        }}
        title="Document Limit Reached"
        message="You have reached the limit of 10 documents for the Free plan. Upgrade to Pro for unlimited documents and custom branding."
        confirmText="Upgrade Now"
        type="primary"
        icon={<AlertTriangle className="text-amber-500" />}
      />
    </div>
  );
}
