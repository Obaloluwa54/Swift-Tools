import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Image as ImageIcon, 
  CheckCircle2, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Layout,
  Zap,
  ExternalLink,
  Crown
} from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { TemplateType, CustomField, BusinessSettings } from '../types';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Your Business Name',
  address: '123 Business Street, Lagos, Nigeria',
  phone: '+234 800 000 0000',
  email: 'hello@business.com',
  website: 'www.business.com',
  logoUrl: 'https://picsum.photos/seed/business/200/200',
  defaultTemplate: 'minimal',
  defaultCustomFields: [],
  plan: 'Free',
};

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('swifttools_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
        defaultCustomFields: parsed.defaultCustomFields || []
      });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('swifttools_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    // Dispatch event for App.tsx to update
    window.dispatchEvent(new Event('settingsUpdated'));
  };

  const paymentConfig = {
    reference: (new Date()).getTime().toString(),
    email: settings.email || "customer@example.com",
    amount: 250000, // ₦2,500 in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    onSuccess: async (response: any) => {
      setIsVerifying(true);
      try {
        // Verify the transaction on the server
        const verifyResponse = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference })
        });

        const result = await verifyResponse.json();

        if (result.status === 'success') {
          const updatedSettings: BusinessSettings = { ...settings, plan: 'Pro' };
          setSettings(updatedSettings);
          localStorage.setItem('swifttools_settings', JSON.stringify(updatedSettings));
          window.dispatchEvent(new Event('settingsUpdated'));
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
          onBack(); // Go back to dashboard after upgrade
        } else {
          setShowError(`Verification failed: ${result.message}`);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setShowError('An error occurred while verifying your payment. Please contact support.');
      } finally {
        setIsVerifying(false);
      }
    },
    onClose: () => {
      console.log('Payment closed');
    },
  };

  const initializePayment = usePaystackPayment(paymentConfig);

  const handleUpgrade = () => {
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      setShowError('Payment system is not configured. Please contact the administrator to set the Paystack Public Key.');
      return;
    }
    initializePayment(paymentConfig as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        setShowError('File size too large. Please choose an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      value: ''
    };
    setSettings({ ...settings, defaultCustomFields: [...(settings.defaultCustomFields || []), newField] });
  };

  const removeCustomField = (id: string) => {
    setSettings({
      ...settings,
      defaultCustomFields: (settings.defaultCustomFields || []).filter(f => f.id !== id)
    });
  };

  const updateCustomField = (id: string, field: 'label' | 'value', value: string) => {
    setSettings({
      ...settings,
      defaultCustomFields: (settings.defaultCustomFields || []).map(f => 
        f.id === id ? { ...f, [field]: value } : f
      )
    });
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Business Settings</h1>
          <p className="text-zinc-500">Manage your default business information for all documents.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {isSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Plan Status Banner */}
          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            settings.plan === 'Pro' 
              ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/20' 
              : 'bg-white border-zinc-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                settings.plan === 'Pro' ? 'bg-white/10 text-amber-400' : 'bg-zinc-50 text-zinc-400'
              }`}>
                {settings.plan === 'Pro' ? <Crown size={24} /> : <Zap size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">SwiftTools {settings.plan}</h2>
                  {settings.plan === 'Pro' && (
                    <span className="px-2 py-0.5 bg-amber-400 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded">Active</span>
                  )}
                </div>
                <p className={settings.plan === 'Pro' ? 'text-zinc-400 text-sm' : 'text-zinc-500 text-sm'}>
                  {settings.plan === 'Pro' 
                    ? 'You have access to all premium features.' 
                    : 'Upgrade to Pro for unlimited documents and custom branding.'}
                </p>
              </div>
            </div>
            {settings.plan === 'Free' && (
              <button
                onClick={handleUpgrade}
                disabled={isVerifying}
                className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Zap size={18} className="text-amber-400" />
                    Upgrade to Pro — ₦2,500
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Building2 size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold">General Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="Enter business name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Business Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all min-h-[100px]"
                  placeholder="Enter business address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="+234 ..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="hello@business.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Website</label>
                <input
                  type="text"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="www.business.com"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <ImageIcon size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold">Branding</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-6 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                <div className="w-24 h-24 rounded-2xl border border-white shadow-sm overflow-hidden bg-white flex items-center justify-center">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon size={32} className="text-zinc-300" />
                  )}
                </div>
                <div className="text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
                  >
                    Upload Logo
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-2">Max 1MB. Square recommended.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Logo URL (Optional)</label>
                <input
                  type="text"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Layout size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold">Customization</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">Default Template</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['minimal', 'professional', 'compact'] as TemplateType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSettings({ ...settings, defaultTemplate: t })}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold capitalize transition-all flex items-center justify-between ${
                        settings.defaultTemplate === t
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/10'
                          : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                      }`}
                    >
                      {t}
                      {settings.defaultTemplate === t && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-50">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-zinc-700">Custom Fields</label>
                  <button
                    onClick={addCustomField}
                    className="text-xs font-bold text-zinc-900 hover:text-zinc-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(settings.defaultCustomFields || []).map((field) => (
                    <div key={field.id} className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Field</span>
                        <button
                          onClick={() => removeCustomField(field.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                        placeholder="Label (e.g. Tax ID)"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                        placeholder="Value"
                      />
                    </div>
                  ))}
                  {settings.defaultCustomFields.length === 0 && (
                    <p className="text-[10px] text-zinc-400 text-center py-4 border border-dashed border-zinc-200 rounded-xl">
                      No custom fields.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <X size={20} />
            <span className="font-medium">{showError}</span>
            <button onClick={() => setShowError(null)} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
