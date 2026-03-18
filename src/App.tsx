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
  CheckCircle2
} from 'lucide-react';
import { Activity } from './types';
import { cn } from './utils';
import ReceiptGenerator from './components/ReceiptGenerator';
import InvoiceGenerator from './components/InvoiceGenerator';
import SettingsComponent from './components/Settings';
import Clients from './components/Clients';
import Products from './components/Products';
import HelpCenter from './components/HelpCenter';
import ConfirmModal from './components/ConfirmModal';

type Tool = 'dashboard' | 'receipt' | 'invoice' | 'settings' | 'clients' | 'products' | 'help';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [stats, setStats] = useState({
    invoices: 0,
    receipts: 0,
    clients: 0,
    products: 0
  });

  useEffect(() => {
    const savedActivities = localStorage.getItem('swifttools_activities');
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
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
    }
  ];

  const handleToolSelect = (tool: Tool) => {
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
              {tool.id === 'clients' && <Users size={20} />}
              {tool.id === 'products' && <Package size={20} />}
              <span className="font-medium">{tool.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2 pt-6 border-t border-zinc-100">
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
              className="p-6 md:p-12 max-w-6xl mx-auto"
            >
              <header className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome back!</h1>
                <p className="text-zinc-500 text-base md:text-lg">Select a tool to get started with your business tasks.</p>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                  { label: 'Invoices', value: stats.invoices, icon: <FileText size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Receipts', value: stats.receipts, icon: <Receipt size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Clients', value: stats.clients, icon: <Users size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Products', value: stats.products, icon: <Package size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 md:p-6 rounded-3xl border border-zinc-100 shadow-sm">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                      {stat.icon}
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-zinc-900">{stat.value}</p>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">Early Access</div>
                      <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">Beta</div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Quick Start Guide</h2>
                    <p className="text-indigo-100 mb-6 text-sm">Complete these steps to get your business up and running.</p>
                    
                    <div className="space-y-3">
                      {[
                        { label: "Set up business profile", done: stats.invoices > 0 || stats.receipts > 0 },
                        { label: "Add your first client", done: stats.clients > 0 },
                        { label: "Create a product catalog", done: stats.products > 0 },
                        { label: "Generate your first document", done: stats.invoices > 0 || stats.receipts > 0 }
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                            step.done ? "bg-white border-white text-indigo-600" : "border-white/30"
                          )}>
                            {step.done && <CheckCircle2 size={12} />}
                          </div>
                          <span className={cn("text-sm font-medium", step.done ? "text-white/60 line-through" : "text-white")}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Sparkles className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
                </div>

                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className="group relative bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">{tool.name}</h3>
                    <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-6">{tool.description}</p>
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                      Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Decorative element */}
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 md:w-32 md:h-32 bg-zinc-50 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
                  </button>
                ))}
              </div>

              <section className="mt-12 md:mt-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold">Recent Activity</h2>
                  {activities.length > 0 && (
                    <button 
                      onClick={() => setShowClearConfirm(true)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <X size={14} />
                      Clear Log
                    </button>
                  )}
                </div>
                <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                  {activities.length > 0 ? (
                    <div className="divide-y divide-zinc-50">
                      {activities.map((activity) => (
                        <div key={activity.id} className="p-4 md:p-6 flex items-center gap-4 hover:bg-zinc-50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            activity.type === 'receipt' ? 'bg-blue-50 text-blue-600' :
                            activity.type === 'invoice' ? 'bg-emerald-50 text-emerald-600' :
                            activity.type === 'client' ? 'bg-orange-50 text-orange-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {activity.type === 'receipt' && <Receipt size={18} />}
                            {activity.type === 'invoice' && <FileText size={18} />}
                            {activity.type === 'client' && <Users size={18} />}
                            {activity.type === 'product' && <Package size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">{activity.action}</p>
                            <p className="text-xs text-zinc-500 truncate">{activity.details}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                              {new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center py-12 md:py-16">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="text-zinc-300" />
                      </div>
                      <p className="text-zinc-400 text-sm md:text-base">No recent activity found. Start by creating a document!</p>
                    </div>
                  )}
                </div>
              </section>
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
        </AnimatePresence>

        <footer className="p-8 border-t border-zinc-100 text-center text-zinc-400 text-sm no-print">
          <p>© {new Date().getFullYear()} SwiftTools. Built with <span className="text-zinc-900 font-bold">Genix</span>.</p>
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
    </div>
  );
}
