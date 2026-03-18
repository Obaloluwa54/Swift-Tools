import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Save, Building2, MapPin, Phone, Globe, Image as ImageIcon, CheckCircle2, Upload } from 'lucide-react';

export interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Your Business Name',
  address: '123 Business Street, Lagos, Nigeria',
  phone: '+234 800 000 0000',
  email: 'hello@business.com',
  website: 'www.business.com',
  logoUrl: 'https://picsum.photos/seed/business/200/200',
};

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('swifttools_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('swifttools_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        alert('File size too large. Please choose an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Building2 size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold">General Info</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Business Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all min-h-[100px]"
                  placeholder="Enter business address"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <ImageIcon size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold">Branding</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Business Logo</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-50 flex-shrink-0 flex items-center justify-center">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon size={32} className="text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold transition-all"
                    >
                      <Upload size={16} />
                      Upload Logo
                    </button>
                    <p className="text-xs text-zinc-400">Recommended: Square image, max 1MB.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-100"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-zinc-400">Or use URL</span>
                  </div>
                </div>

                <div>
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
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Phone size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold">Contact Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="+234 ..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="hello@business.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Website</label>
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

          <div className="bg-zinc-900 p-8 rounded-3xl text-white">
            <h3 className="text-lg font-bold mb-2">Pro Tip 💡</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The information you save here will be automatically filled in whenever you create a new receipt or invoice. 
              This saves you time and ensures consistency across all your business documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
