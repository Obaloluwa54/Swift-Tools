import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Printer, ArrowLeft, Share2, MessageCircle, Layout, Globe, Phone, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReceiptData, TemplateType } from '../types';
import { cn } from '../utils';
import { motion } from 'motion/react';

export default function ReceiptGenerator({ onBack }: { onBack: () => void }) {
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
    template: 'modern'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('swifttools_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setData(prev => ({
        ...prev,
        businessName: settings.businessName || prev.businessName,
        businessAddress: settings.address || prev.businessAddress,
        businessPhone: settings.phone,
        businessEmail: settings.email,
        businessWebsite: settings.website,
        logoUrl: settings.logoUrl,
      }));
    }
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
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData({ ...data, items: newItems, total: calculateTotal(newItems) });
  };

  const updateItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...data.items];
    if (field === 'amount') {
      newItems[index].amount = Number(value);
    } else {
      newItems[index].description = String(value);
    }
    setData({ ...data, items: newItems, total: calculateTotal(newItems) });
  };

  const handleDownload = async () => {
    if (!validate()) return;
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { 
      scale: 2,
      useCORS: true,
      logging: false
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${data.receiptNumber}.pdf`);
  };

  const handleWhatsAppShare = () => {
    if (!validate()) return;
    const text = `Receipt from ${data.businessName}\nReceipt #: ${data.receiptNumber}\nTotal: ${data.currency}${data.total.toFixed(2)}\nDate: ${data.date}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
            onClick={handleWhatsAppShare}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <MessageCircle size={18} />
            Share
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
            <div className="flex items-center gap-2 mb-4">
              <Layout className="text-zinc-400" size={20} />
              <h3 className="text-lg font-semibold text-zinc-900">Choose Template</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['modern', 'classic', 'minimal'] as TemplateType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setData({ ...data, template: t })}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all",
                    data.template === t 
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
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
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Customer & Info</h3>
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
              <h3 className="text-lg font-semibold text-zinc-900">Items</h3>
              <button 
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
            {data.items.map((item, index) => (
              <div key={index} className="flex gap-2 sm:gap-4 items-start">
                <input 
                  type="text" 
                  placeholder="Description"
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Amount"
                  className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 text-sm"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                />
                <button 
                  onClick={() => removeItem(index)}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
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
                "bg-white p-6 sm:p-12 shadow-2xl border border-zinc-100 min-h-[600px] flex flex-col transition-all duration-500",
                data.template === 'minimal' && "p-8 sm:p-16",
                data.template === 'classic' && "bg-[#FFFEF9] border-[#E5E1D1]"
              )}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Template: Modern */}
              {data.template === 'modern' && (
                <>
                  <div className="flex justify-between items-start mb-12">
                    <div className="flex items-start gap-4">
                      {data.logoUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                          <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-3xl font-bold text-zinc-900 mb-2 uppercase tracking-tighter">Receipt</h1>
                        <p className="text-zinc-500 text-sm">{data.receiptNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="font-bold text-zinc-900">{data.businessName}</h2>
                      <p className="text-zinc-500 text-sm whitespace-pre-line max-w-[200px] ml-auto">{data.businessAddress}</p>
                      <div className="mt-2 space-y-1 text-xs text-zinc-400">
                        {data.businessPhone && <p className="flex items-center justify-end gap-1"><Phone size={10} /> {data.businessPhone}</p>}
                        {data.businessEmail && <p className="flex items-center justify-end gap-1"><Mail size={10} /> {data.businessEmail}</p>}
                        {data.businessWebsite && <p className="flex items-center justify-end gap-1"><Globe size={10} /> {data.businessWebsite}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Billed To</p>
                      <p className="font-medium text-zinc-900">{data.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Date</p>
                      <p className="font-medium text-zinc-900">{data.date}</p>
                    </div>
                  </div>

                  <table className="w-full mb-12">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="text-left py-4 text-xs uppercase tracking-widest text-zinc-400 font-semibold">Description</th>
                        <th className="text-right py-4 text-xs uppercase tracking-widest text-zinc-400 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, index) => (
                        <tr key={index} className="border-b border-zinc-50">
                          <td className="py-4 text-zinc-700">{item.description || 'No description'}</td>
                          <td className="py-4 text-right text-zinc-900 font-medium">{data.currency}{item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-auto pt-8 border-t border-zinc-100">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Payment Method</p>
                        <p className="text-zinc-700">{data.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Total Amount</p>
                        <p className="text-4xl font-bold text-zinc-900">{data.currency}{data.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Template: Classic */}
              {data.template === 'classic' && (
                <>
                  <div className="text-center mb-12 border-b-2 border-zinc-900 pb-8">
                    {data.logoUrl && (
                      <div className="w-20 h-20 mx-auto mb-4 grayscale opacity-80">
                        <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">{data.businessName}</h2>
                    <p className="text-zinc-600 text-sm italic">{data.businessAddress}</p>
                    <div className="mt-2 flex items-center justify-center gap-4 text-xs text-zinc-500 italic">
                      {data.businessPhone && <span>{data.businessPhone}</span>}
                      {data.businessEmail && <span>{data.businessEmail}</span>}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-sm">
                    <div>
                      <p><strong>Customer:</strong> {data.customerName}</p>
                      <p><strong>Payment:</strong> {data.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Receipt #:</strong> {data.receiptNumber}</p>
                      <p><strong>Date:</strong> {data.date}</p>
                    </div>
                  </div>

                  <div className="border-y-2 border-zinc-900 py-4 mb-8">
                    <div className="grid grid-cols-12 gap-4 font-bold text-sm uppercase mb-4">
                      <div className="col-span-8">Description</div>
                      <div className="col-span-4 text-right">Amount</div>
                    </div>
                    {data.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 text-sm mb-2">
                        <div className="col-span-8">{item.description}</div>
                        <div className="col-span-4 text-right">{data.currency}{item.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mb-8">
                    <div className="w-48 border-t border-zinc-900 pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{data.currency}{data.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Template: Minimal */}
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
                    </div>
                  </div>

                  <div className="space-y-8 mb-16">
                    {data.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-baseline">
                        <div className="flex-1 border-b border-dotted border-zinc-200 mr-4">
                          <span className="bg-white pr-2 text-zinc-600">{item.description}</span>
                        </div>
                        <span className="font-mono text-zinc-900">{data.currency}{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-zinc-400">
                        <p>Billed to: {data.customerName}</p>
                        <p>Paid via: {data.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-tighter mb-1">Total</p>
                        <p className="text-5xl font-black text-zinc-900">{data.currency}{data.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Common Footer Notes */}
              {data.notes && (
                <div className={cn(
                  "mt-8 p-4 rounded-lg",
                  data.template === 'classic' ? "border border-zinc-200 italic" : "bg-zinc-50"
                )}>
                  <p className="text-xs text-zinc-400 mb-1">Notes</p>
                  <p className="text-sm text-zinc-600 italic">{data.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
