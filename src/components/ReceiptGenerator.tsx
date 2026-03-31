import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Printer, ArrowLeft, Share2, MessageCircle, Layout, Globe, Phone, Mail, Users, Package, Search, X, Sparkles, CreditCard } from 'lucide-react';
import { domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { ReceiptData, TemplateType, Client, Product, BusinessSettings } from '../types';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function ReceiptGenerator({ onBack, onActivity }: { onBack: () => void; onActivity?: (action: string, details: string) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState<{ index: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [data, setData] = useState<ReceiptData>({
    businessName: 'SwiftTools Inc.',
    businessAddress: '123 Business Ave, Tech City',
    customerName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: `REC-${Math.floor(Math.random() * 100000)}`,
    items: [{ description: 'Service Fee', amount: 50.00 }],
    currency: '₦',
    total: 50.00,
    paymentMethod: 'Credit Card',
    notes: 'Thank you for your business!',
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
        customFields: settings.defaultCustomFields ? [...settings.defaultCustomFields] : prev.customFields
      }));
    }

    const savedClients = localStorage.getItem('swifttools_clients');
    if (savedClients) setClients(JSON.parse(savedClients) || []);

    const savedProducts = localStorage.getItem('swifttools_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts) || []);
  }, []);

  const receiptRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    if (data.items.length === 0) {
      setError('Please add at least one item.');
      return false;
    }
    if (data.items.some(item => !item.description.trim())) {
      setError('All item descriptions are required.');
      return false;
    }
    setError(null);
    return true;
  };

  const calculateTotal = (items: Array<{ description: string; amount: number }>) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const addItem = () => {
    const newItems = [...data.items, { description: '', amount: 0 }];
    setData({ ...data, items: newItems, total: calculateTotal(newItems) });
    onActivity?.('Added Item', 'Added a new item to the receipt');
  };

  const removeItem = (index: number) => {
    const itemToRemove = data.items[index];
    const newItems = data.items.filter((_, i) => i !== index);
    setData({ ...data, items: newItems, total: calculateTotal(newItems) });
    if (itemToRemove.description) {
      onActivity?.('Removed Item', `Removed item: ${itemToRemove.description}`);
    }
  };

  const updateItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...data.items];
    if (field === 'amount') {
      newItems[index].amount = Number(value) || 0;
    } else {
      newItems[index].description = String(value);
    }
    setData({ ...data, items: newItems, total: calculateTotal(newItems) });
  };

  const addCustomField = () => {
    setData({
      ...data,
      customFields: [...(data.customFields || []), { label: '', value: '' }]
    });
  };

  const removeCustomField = (index: number) => {
    setData({
      ...data,
      customFields: data.customFields?.filter((_, i) => i !== index)
    });
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    const newFields = [...(data.customFields || [])];
    newFields[index] = { ...newFields[index], [field]: value };
    setData({ ...data, customFields: newFields });
  };

  const resetForm = () => {
    const savedSettings = localStorage.getItem('swifttools_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;

    setData({
      ...data,
      customerName: '',
      items: [{ description: '', amount: 0 }],
      total: 0,
      notes: '',
      customFields: settings?.defaultCustomFields ? [...settings.defaultCustomFields] : []
    });
    onActivity?.('Cleared Form', 'Reset all fields in the receipt generator');
  };

  const handleDownload = async () => {
    if (!validate()) return;
    if (!receiptRef.current) return;
    
    try {
      const canvas = await domToCanvas(receiptRef.current, { 
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${data.receiptNumber}.pdf`);
      
      // Save to localStorage for dashboard
      const savedReceipts = JSON.parse(localStorage.getItem('swifttools_receipts') || '[]');
      localStorage.setItem('swifttools_receipts', JSON.stringify([data, ...savedReceipts]));
      
      onActivity?.('Generated Receipt', `Receipt #${data.receiptNumber} for ${data.customerName}`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleWhatsAppShare = () => {
    if (!validate()) return;
    const text = `Receipt from ${data.businessName}\nReceipt #: ${data.receiptNumber}\nTotal: ${data.currency}${data.total.toFixed(2)}\nDate: ${data.date}\n\nView here: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onActivity?.('Shared Receipt', `Shared Receipt #${data.receiptNumber} via WhatsApp`);
  };

  const handleEmailShare = () => {
    if (!validate()) return;
    const subject = `Receipt #${data.receiptNumber} from ${data.businessName}`;
    const body = `Hello ${data.customerName},\n\nThank you for your payment of ${data.currency}${data.total.toFixed(2)}.\n\nReceipt #: ${data.receiptNumber}\nDate: ${data.date}\n\nThank you for your business!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    onActivity?.('Shared Receipt', `Shared Receipt #${data.receiptNumber} via Email`);
  };

  const handlePrint = () => {
    if (!validate()) return;
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} />
              Clear
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Share via WhatsApp"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
            <button 
              onClick={handleEmailShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              title="Share via Email"
            >
              <Mail size={18} />
              Email
            </button>
            <button 
              onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            <Printer size={18} />
            Print
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Editor */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Template</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['minimal', 'professional', 'compact'] as TemplateType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setData({ ...data, template: t })}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all",
                    data.template === t 
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-sm" 
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Business Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" 
                placeholder="Business Name"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.businessName}
                onChange={(e) => setData({ ...data, businessName: e.target.value })}
              />
              <textarea 
                placeholder="Business Address"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.businessAddress}
                onChange={(e) => setData({ ...data, businessAddress: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Customer & Info</h3>
              <button 
                onClick={() => setShowClientSelector(true)}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100 transition-all"
              >
                <Users size={14} /> Select Client
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Customer Name"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.customerName}
                onChange={(e) => setData({ ...data, customerName: e.target.value })}
              />
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Receipt #"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.receiptNumber}
                onChange={(e) => setData({ ...data, receiptNumber: e.target.value })}
              />
              <select 
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.paymentMethod}
                onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
              </select>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={data.currency}
                onChange={(e) => setData({ ...data, currency: e.target.value })}
              >
                <option value="₦">Naira (₦)</option>
                <option value="$">US Dollar ($)</option>
                <option value="€">Euro (€)</option>
                <option value="£">Pound (£)</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Custom Fields</h3>
              <button 
                onClick={addCustomField}
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <Plus size={16} /> Add Field
              </button>
            </div>
            <div className="space-y-3">
              {data.customFields?.map((field, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input 
                    type="text" 
                    placeholder="Label"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm"
                    value={field.label}
                    onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Value"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm"
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  />
                  <button 
                    onClick={() => removeCustomField(index)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {(!data.customFields || data.customFields.length === 0) && (
                <p className="text-xs text-zinc-400 text-center py-2 italic">No custom fields added</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Items</h3>
              <button 
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
            {(data.items || []).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-2 sm:gap-4 items-start">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Description"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                    <button 
                      onClick={() => setShowProductSelector({ index })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                      title="Select from catalog"
                    >
                      <Package size={14} />
                    </button>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Amount"
                    className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm"
                    value={item.amount || ''}
                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  />
                  <button 
                    onClick={() => removeItem(index)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div 
              ref={receiptRef}
              className={cn(
                "bg-white shadow-2xl border border-zinc-100 h-auto min-h-[600px] flex flex-col transition-all duration-500",
                data.template === 'minimal' ? "p-8 sm:p-16" : 
                data.template === 'professional' ? "p-0" : "p-6 sm:p-10"
              )}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {data.template === 'minimal' && (
                <>
                  <div className="mb-16 flex justify-between items-start">
                    <h1 className="text-6xl font-black text-zinc-900 opacity-10 absolute top-8 left-8 select-none">REC</h1>
                    <div className="relative">
                      {data.logoUrl && (
                        <div className="w-10 h-10 mb-4 opacity-50 grayscale">
                          <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <h2 className="text-xl font-bold text-zinc-900">{data.businessName}</h2>
                      <p className="text-zinc-400 text-xs tracking-widest uppercase">{data.receiptNumber} / {data.date}</p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-400 uppercase tracking-widest space-y-1">
                      {data.businessPhone && <p>{data.businessPhone}</p>}
                      {data.businessWebsite && <p>{data.businessWebsite}</p>}
                      {data.customFields?.map((field, idx) => (
                        <p key={idx}>{field.label}: {field.value}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 mb-16">
                    {(data.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between items-baseline">
                        <div className="flex-1 border-b border-dotted border-zinc-200 mr-4">
                          <span className="bg-white pr-2 text-zinc-600">{item.description}</span>
                        </div>
                        <span className="font-mono text-zinc-900">{data.currency}{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {data.template === 'professional' && (
                <>
                  <div className="bg-zinc-900 text-white p-8 sm:p-12 mb-8">
                    <div className="flex justify-between items-start">
                      <div>
                        {data.logoUrl && (
                          <div className="w-12 h-12 mb-4 bg-white p-2 rounded-lg">
                            <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <h2 className="text-2xl font-bold">{data.businessName}</h2>
                        <p className="text-zinc-400 text-sm">{data.businessAddress}</p>
                      </div>
                      <div className="text-right">
                        <h1 className="text-3xl font-black tracking-tighter mb-2">RECEIPT</h1>
                        <p className="text-zinc-400 text-xs uppercase tracking-widest">#{data.receiptNumber}</p>
                        <p className="text-zinc-400 text-xs">{data.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 sm:px-12 py-4">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">Customer</p>
                        <p className="text-sm font-bold text-zinc-900">{data.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">Details</p>
                        <div className="text-xs text-zinc-600 space-y-1">
                          <p>Method: {data.paymentMethod}</p>
                          {data.customFields?.map((field, idx) => (
                            <p key={idx}>{field.label}: {field.value}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <table className="w-full mb-8">
                      <thead>
                        <tr className="border-b-2 border-zinc-900">
                          <th className="text-left py-3 text-xs uppercase tracking-widest font-bold text-zinc-900">Description</th>
                          <th className="text-right py-3 text-xs uppercase tracking-widest font-bold text-zinc-900">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.items || []).map((item, index) => (
                          <tr key={index} className="border-b border-zinc-100">
                            <td className="py-4 text-sm text-zinc-600">{item.description}</td>
                            <td className="py-4 text-right font-mono text-zinc-900">{data.currency}{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {data.template === 'compact' && (
                <div className="p-4 sm:p-6 border-2 border-zinc-900 m-4 flex-1 flex flex-col">
                  <div className="text-center border-b-2 border-zinc-900 pb-4 mb-4">
                    {data.logoUrl && (
                      <img src={data.logoUrl} alt="Logo" className="w-8 h-8 mx-auto mb-2 object-contain grayscale" referrerPolicy="no-referrer" />
                    )}
                    <h2 className="text-lg font-black uppercase tracking-tight">{data.businessName}</h2>
                    <p className="text-[10px] text-zinc-500">{data.businessAddress}</p>
                  </div>

                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold mb-4">
                    <span>{data.receiptNumber}</span>
                    <span>{data.date}</span>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    {(data.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-zinc-600">{item.description}</span>
                        <span className="font-bold">{data.currency}{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {data.customFields?.map((field, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-zinc-400">
                        <span>{field.label}</span>
                        <span>{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Footer */}
              <div className="mt-auto pt-8 border-t border-zinc-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8">
                  <div className="space-y-6 flex-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-2 text-zinc-400">Payment Info</p>
                      <p className="text-sm text-zinc-700">{data.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="text-right min-w-[200px]">
                    <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-zinc-400">Total Amount</p>
                    <p className="text-5xl font-black text-zinc-900">{data.currency}{data.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Common Footer Notes */}
              {data.notes && (
                <div className="mt-8 p-4 rounded-lg bg-zinc-50">
                  <p className="text-xs text-zinc-400 mb-1">Notes</p>
                  <p className="text-sm text-zinc-600 italic">{data.notes}</p>
                </div>
              )}

              {businessSettings?.plan === 'Free' && (
                <div className="mt-8 pt-4 border-t border-zinc-50 text-center">
                  <p className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">
                    Generated with <span className="text-zinc-900">SwiftTools</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Selector Modal */}
      <AnimatePresence>
        {showClientSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Select Client</h3>
                <button onClick={() => setShowClientSelector(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-zinc-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(clients || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  (clients || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setData({ ...data, customerName: client.name });
                        setShowClientSelector(false);
                        setSearchQuery('');
                        onActivity?.('Selected Client', `Selected client: ${client.name} for receipt`);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-zinc-900 group-hover:text-zinc-900">{client.name}</p>
                        <p className="text-sm text-zinc-500">{client.email}</p>
                      </div>
                      <ArrowLeft className="rotate-180 text-zinc-300 group-hover:text-zinc-900" size={18} />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No clients found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Selector Modal */}
      <AnimatePresence>
        {showProductSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Select Product</h3>
                <button onClick={() => setShowProductSelector(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-zinc-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(products || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  (products || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        updateItem(showProductSelector.index, 'description', product.name);
                        updateItem(showProductSelector.index, 'amount', product.price);
                        setShowProductSelector(null);
                        setSearchQuery('');
                        onActivity?.('Selected Product', `Selected product: ${product.name} for receipt`);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-zinc-900 group-hover:text-zinc-900">{product.name}</p>
                        <p className="text-sm text-zinc-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-900">{data.currency}{product.price.toFixed(2)}</p>
                        <ArrowLeft className="rotate-180 text-zinc-300 group-hover:text-zinc-900 ml-auto" size={18} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={resetForm}
        title="Clear Form"
        message="Are you sure you want to clear all fields? This action cannot be undone."
        confirmText="Clear Everything"
      />
    </div>
  );
}
