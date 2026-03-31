export type TemplateType = 'minimal' | 'professional' | 'compact';

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface ReceiptData {
  businessName: string;
  businessAddress: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  logoUrl?: string;
  customerName: string;
  date: string;
  receiptNumber: string;
  items: Array<{ description: string; amount: number }>;
  currency: string;
  total: number;
  paymentMethod: string;
  notes?: string;
  template: TemplateType;
  customFields?: CustomField[];
}

export interface InvoiceData extends Omit<ReceiptData, 'template' | 'customFields'> {
  invoiceNumber: string;
  dueDate: string;
  clientEmail: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  template: TemplateType;
  customFields?: CustomField[];
}

export interface QuoteData extends Omit<InvoiceData, 'invoiceNumber'> {
  quoteNumber: string;
  validUntil: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  category?: 'Potential' | 'Repeat' | 'VIP' | 'Other';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
}

export interface Activity {
  id: string;
  type: 'receipt' | 'invoice' | 'client' | 'product' | 'expense' | 'quote';
  action: string;
  timestamp: string;
  details: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  defaultTemplate: TemplateType;
  defaultCustomFields: CustomField[];
  plan: 'Free' | 'Pro';
}
