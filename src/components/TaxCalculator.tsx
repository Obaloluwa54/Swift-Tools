import React, { useState } from 'react';
import { ArrowLeft, Calculator, Percent, DollarSign, Info, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function TaxCalculator({ onBack }: { onBack: () => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(7.5);
  const [isInclusive, setIsInclusive] = useState<boolean>(false);

  const calculateTax = () => {
    if (isInclusive) {
      // Amount is tax-inclusive: Tax = Amount - (Amount / (1 + Rate/100))
      const baseAmount = amount / (1 + taxRate / 100);
      const taxAmount = amount - baseAmount;
      return { base: baseAmount, tax: taxAmount, total: amount };
    } else {
      // Amount is tax-exclusive: Tax = Amount * (Rate/100)
      const taxAmount = (amount * taxRate) / 100;
      const totalAmount = amount + taxAmount;
      return { base: amount, tax: taxAmount, total: totalAmount };
    }
  };

  const results = calculateTax();

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <header className="mb-12">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-zinc-900 text-white rounded-2xl">
            <Calculator size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Calculator</h1>
        </div>
        <p className="text-zinc-500">Quickly calculate VAT, Sales Tax, or any percentage-based tax.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Amount</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number" 
                  value={amount || ''} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Tax Rate (%)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Percent size={18} />
                </div>
                <input 
                  type="number" 
                  value={taxRate || ''} 
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-lg font-bold"
                  placeholder="7.5"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[5, 7.5, 10, 15, 20].map(rate => (
                  <button 
                    key={rate} 
                    onClick={() => setTaxRate(rate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${taxRate === rate ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-50">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setIsInclusive(!isInclusive)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isInclusive ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isInclusive ? 'left-7' : 'left-1'}`} />
                </div>
                <span className="text-sm font-semibold text-zinc-700">Tax Inclusive Amount</span>
              </label>
              <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                <Info size={12} />
                {isInclusive ? 'The amount already includes the tax.' : 'The tax will be added to the amount.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl shadow-zinc-900/20 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Calculator size={120} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Calculation Result</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-400 text-sm">Base Amount</span>
                  <span className="text-xl font-mono">₦{results.base.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-zinc-400 text-sm">Tax Amount ({taxRate}%)</span>
                  <span className="text-xl font-mono text-amber-400">+₦{results.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-3xl font-black tracking-tight">₦{results.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setAmount(0); setTaxRate(7.5); setIsInclusive(false); }}
              className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              Reset Calculator
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Quick Tip
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              In Nigeria, the standard VAT rate is 7.5%. Use this tool to quickly find the tax component of your sales or purchases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
