import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, FileText, LayoutDashboard, Settings, HelpCircle, ChevronRight, Sparkles, Menu, X } from 'lucide-react';
import ReceiptGenerator from './components/ReceiptGenerator';
import InvoiceGenerator from './components/InvoiceGenerator';
import SettingsComponent from './components/Settings';

type Tool = 'dashboard' | 'receipt' | 'invoice' | 'settings';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              {tool.id === 'receipt' ? <Receipt size={20} /> : <FileText size={20} />}
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-50 transition-all">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                <h2 className="text-xl md:text-2xl font-bold mb-6">Recent Activity</h2>
                <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-8 text-center py-12 md:py-16">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutDashboard className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 text-sm md:text-base">No recent activity found. Start by creating a document!</p>
                  </div>
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
              <ReceiptGenerator onBack={() => setActiveTool('dashboard')} />
            </motion.div>
          )}

          {activeTool === 'invoice' && (
            <motion.div 
              key="invoice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <InvoiceGenerator onBack={() => setActiveTool('dashboard')} />
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
        </AnimatePresence>
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
    </div>
  );
}
