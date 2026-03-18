export type TemplateType = 'modern' | 'classic' | 'minimal';

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
}

export interface InvoiceData extends Omit<ReceiptData, 'template'> {
  invoiceNumber: string;
  dueDate: string;
  clientEmail: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  template: TemplateType;
}
