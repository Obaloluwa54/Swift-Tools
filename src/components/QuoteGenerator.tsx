import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Printer, ArrowLeft, MessageCircle, Layout, Globe, Phone, Mail, Users, Package, Search, X, Sparkles, CreditCard, Share2, FileText } from 'lucide-react';
import { domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { QuoteData, TemplateType, Client, Product, BusinessSettings } from '../types';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

export default function QuoteGenerator({ onBack, onActivity }: { onBack: () => void; onActivity?: (action: string, details: string) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState<{ index: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [data, setData] = useState<QuoteData>({
    businessName: 'SwiftTools Inc.',
    businessAddress: '123 Business Ave, Tech City',
    customerName: '',
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quoteNumber: `QT-${Math.floor(Math.random() * 100000)}`,
    receiptNumber: '',
    items: [{ description: '', amount: 0 }],
    currency: '₦',
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    paymentMethod: 'Bank Transfer',
    notes: 'This quote is valid for 30 days. Thank you!',
    template: 'minimal',
    customFields: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('swifttools_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setBusinessSettings(settings);
      setData(prev => ({
        ...prev,
        businessName: settings.businessName || prev.businessName,
        businessAddress: settings.address || prev.businessAddress,
        businessPhone: settings.phone,
        businessEmail: settings.email,
        businessWebsite: settings.website,
        logoUrl: settings.logoUrl,
        template: settings.defaultTemplate || prev.template,
        customFields: settings.defaultCustomFields || prev.customFields,
      }));
    }

    const savedClients = localStorage.getItem('swifttools_clients');
    if (savedClients) setClients(JSON.parse(savedClients) || []);

    const savedProducts = localStorage.getItem('swifttools_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts) || []);
  }, []);

  const quoteRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    if (data.items.length === 0 || !data.items[0].description) {
      setError('Please add at least one item.');
      return false;
    }
    setError(null);
    return true;
  };

  const calculateTotals = (items: Array<{ description: string; amount: number }>, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const addItem = () => {
    const newItems = [...data.items, { description: '', amount: 0 }];
    const totals = calculateTotals(newItems, data.taxRate);
    setData({ ...data, items: newItems, ...totals });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    const totals = calculateTotals(newItems, data.taxRate);
    setData({ ...data, items: newItems, ...totals });
  };

  const updateItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...data.items];
    if (field === 'amount') {
      newItems[index].amount = Number(value) || 0;
    } else {
      newItems[index].description = String(value);
    }
    const totals = calculateTotals(newItems, data.taxRate);
    setData({ ...data, items: newItems, ...totals });
  };

  const handleDownload = async () => {
    if (!validate()) return;
    if (!quoteRef.current) return;
    
    try {
      const canvas = await domToCanvas(quoteRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${data.quoteNumber}.pdf`);
      
      onActivity?.('Generated Quote', `Quote #${data.quoteNumber} for ${data.customerName}`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors w-fit">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleDownload} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5 space-y-6 no-print">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
          
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Quote Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" 
                placeholder="Quote #"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.quoteNumber}
                onChange={(e) => setData({ ...data, quoteNumber: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 ml-1">Date</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg border border-zinc-200" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 ml-1">Valid Until</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg border border-zinc-200" value={data.validUntil} onChange={(e) => setData({ ...data, validUntil: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Client Info</h3>
              <button onClick={() => setShowClientSelector(true)} className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100">
                <Users size={14} /> Select Client
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Client Name" className="w-full px-4 py-2 rounded-lg border border-zinc-200" value={data.customerName} onChange={(e) => setData({ ...data, customerName: e.target.value })} />
              <input type="email" placeholder="Client Email" className="w-full px-4 py-2 rounded-lg border border-zinc-200" value={data.clientEmail} onChange={(e) => setData({ ...data, clientEmail: e.target.value })} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Line Items</h3>
              <button onClick={addItem} className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900">
                <Plus size={16} /> Add Item
              </button>
            </div>
            {data.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 relative">
                  <input type="text" placeholder="Description" className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                  <button onClick={() => setShowProductSelector({ index })} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                    <Package size={14} />
                  </button>
                </div>
                <input type="number" placeholder="Amount" className="w-24 px-3 py-2 rounded-lg border border-zinc-200 text-sm" value={item.amount || ''} onChange={(e) => updateItem(index, 'amount', e.target.value)} />
                <button onClick={() => removeItem(index)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div ref={quoteRef} className="bg-white shadow-2xl border border-zinc-100 p-12 min-h-[800px] flex flex-col">
            <div className="flex justify-between items-start mb-16">
              <div>
                {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-4" referrerPolicy="no-referrer" />}
                <h2 className="text-2xl font-bold text-zinc-900">{data.businessName}</h2>
                <p className="text-zinc-500 text-sm">{data.businessAddress}</p>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black text-zinc-900 mb-2">QUOTE</h1>
                <p className="text-zinc-400 font-mono">#{data.quoteNumber}</p>
                <div className="mt-4 text-sm text-zinc-500">
                  <p>Date: {data.date}</p>
                  <p>Valid Until: {data.validUntil}</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Quote For</h4>
              <p className="font-bold text-zinc-900 text-lg">{data.customerName || 'Client Name'}</p>
              <p className="text-zinc-500">{data.clientEmail || 'client@email.com'}</p>
            </div>

            <table className="w-full text-left border-collapse mb-12">
              <thead>
                <tr className="border-b-2 border-zinc-900">
                  <th className="py-4 text-xs font-bold uppercase tracking-widest">Description</th>
                  <th className="py-4 text-right text-xs font-bold uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-100">
                    <td className="py-6 text-zinc-900">{item.description || 'Item Description'}</td>
                    <td className="py-6 text-right font-mono text-lg">{data.currency}{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-auto">
              <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between font-bold text-2xl pt-3 border-t-2 border-zinc-900">
                    <span>Total</span>
                    <span>{data.currency}{data.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-zinc-100">
                <p className="text-xs text-zinc-400 uppercase font-bold mb-2">Notes</p>
                <p className="text-sm text-zinc-600 italic">{data.notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals (Client/Product) - Simplified for brevity, would be full versions in real app */}
      <AnimatePresence>
        {showClientSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Client</h3>
                <button onClick={() => setShowClientSelector(false)}><X /></button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clients.map(c => (
                  <button key={c.id} onClick={() => { setData({...data, customerName: c.name, clientEmail: c.email}); setShowClientSelector(false); }} className="w-full p-4 text-left border rounded-xl hover:bg-zinc-50">
                    <p className="font-bold">{c.name}</p>
                    <p className="text-sm text-zinc-500">{c.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProductSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Product</h3>
                <button onClick={() => setShowProductSelector(null)}><X /></button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map(p => (
                  <button key={p.id} onClick={() => { updateItem(showProductSelector.index, 'description', p.name); updateItem(showProductSelector.index, 'amount', p.price); setShowProductSelector(null); }} className="w-full p-4 text-left border rounded-xl hover:bg-zinc-50">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm text-zinc-500">{p.category}</p>
                    <p className="font-bold">{data.currency}{p.price}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
