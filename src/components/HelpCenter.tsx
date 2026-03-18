import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Mail, 
  ChevronRight,
  Search,
  FileText,
  Shield,
  Zap,
  X
} from 'lucide-react';
import { cn } from '../utils';

interface HelpCenterProps {
  onBack: () => void;
}

export default function HelpCenter({ onBack }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const faqs = [
    {
      question: "How do I download my invoice as PDF?",
      answer: "Once you've filled in all the details, click the 'PDF' button at the top right of the invoice generator. This will automatically generate and download a professional PDF version of your invoice.",
      category: "Invoices & Receipts"
    },
    {
      question: "Can I save my client details?",
      answer: "Yes! Use the 'Client Manager' tool to save your recurring customers. When creating an invoice or receipt, you can then quickly select them using the 'Select Client' button.",
      category: "Getting Started"
    },
    {
      question: "Is my data secure?",
      answer: "SwiftTools stores your business details, clients, and products locally in your browser. We don't store your sensitive business data on our servers, ensuring your privacy.",
      category: "Privacy & Security"
    },
    {
      question: "How do I add tax to my invoices?",
      answer: "In the Invoice Generator, you'll find a 'Tax %' field in the totals section. Enter your local tax rate, and the tool will automatically calculate the tax amount and total for you.",
      category: "Invoices & Receipts"
    },
    {
      question: "How do I change my business logo?",
      answer: "Go to the 'Settings' tab in the sidebar. There you can upload a new logo or provide a URL for your business logo. It will be automatically applied to all new documents.",
      category: "Getting Started"
    },
    {
      question: "Can I use SwiftTools offline?",
      answer: "Yes! SwiftTools is a Progressive Web App. Once loaded, most features will work even without an internet connection, as your data is stored locally.",
      category: "Pro Tips"
    }
  ];

  const categories = [
    { icon: <Book className="text-blue-600" />, title: "Getting Started", count: 2 },
    { icon: <FileText className="text-emerald-600" />, title: "Invoices & Receipts", count: 2 },
    { icon: <Shield className="text-purple-600" />, title: "Privacy & Security", count: 1 },
    { icon: <Zap className="text-orange-600" />, title: "Pro Tips", count: 1 },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? faq.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
            <HelpCircle className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        </div>
        <p className="text-zinc-500 text-lg">Everything you need to know about using SwiftTools effectively.</p>
      </header>

      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all text-lg"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {categories.map((cat, i) => (
          <button 
            key={i}
            onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
            className={cn(
              "flex items-center justify-between p-6 rounded-2xl border transition-all text-left group",
              activeCategory === cat.title 
                ? "bg-zinc-900 border-zinc-900 shadow-lg shadow-zinc-900/10" 
                : "bg-white border-zinc-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                activeCategory === cat.title ? "bg-white/10" : "bg-zinc-50"
              )}>
                {cat.icon}
              </div>
              <div>
                <h3 className={cn(
                  "font-bold",
                  activeCategory === cat.title ? "text-white" : "text-zinc-900"
                )}>{cat.title}</h3>
                <p className={cn(
                  "text-sm",
                  activeCategory === cat.title ? "text-zinc-400" : "text-zinc-500"
                )}>{cat.count} articles</p>
              </div>
            </div>
            <ChevronRight size={18} className={cn(
              "transition-all",
              activeCategory === cat.title ? "text-white rotate-90" : "text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1"
            )} />
          </button>
        ))}
      </div>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {searchQuery || activeCategory ? `Results (${filteredFaqs.length})` : "Frequently Asked Questions"}
          </h2>
          {(searchQuery || activeCategory) && (
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400 rounded-md border border-zinc-100">
                    {faq.category}
                  </span>
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{faq.question}</h3>
                <p className="text-zinc-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
              <Search size={48} className="mx-auto mb-4 text-zinc-300" />
              <p className="text-zinc-500">No results found for your search or category selection.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-zinc-900 rounded-3xl p-8 md:p-12 text-center text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">Our support team is always ready to assist you with any questions or technical issues.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:support@swifttools.com"
              className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold hover:bg-zinc-100 transition-colors w-full sm:w-auto justify-center"
            >
              <Mail size={18} />
              Email Support
            </a>
            <button className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors w-full sm:w-auto justify-center">
              <MessageSquare size={18} />
              Live Chat
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </section>
    </div>
  );
}
