import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Tag, DollarSign, Edit2, Trash2, X, CheckCircle2, PackagePlus } from 'lucide-react';
import { Product } from '../types';
import ConfirmModal from './ConfirmModal';

interface ProductsProps {
  onBack: () => void;
  onActivity?: (action: string, details: string) => void;
}

export default function Products({ onBack, onActivity }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: '',
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('swifttools_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts) || []);
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('swifttools_products', JSON.stringify(newProducts));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id ? { ...formData, id: p.id } : p
      );
      saveProducts(updatedProducts);
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
      };
      saveProducts([newProduct, ...products]);
      onActivity?.('Added Product', `Added product: ${formData.name}`);
    }
    setFormData({ name: '', description: '', price: 0, category: '' });
    setIsAddingProduct(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      saveProducts(products.filter((p) => p.id !== id));
      onActivity?.('Deleted Product', `Deleted product: ${product.name}`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || '',
    });
    setIsAddingProduct(true);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Product Catalog</h1>
          <p className="text-zinc-500">Manage your items and services for quick document creation.</p>
        </div>
        <button
          onClick={() => setIsAddingProduct(true)}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
        >
          <PackagePlus size={20} />
          Add New Product
        </button>
      </header>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 font-bold text-xl">
                  <Package size={24} className="text-zinc-600" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setProductToDelete(product.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                {product.category && (
                  <span className="text-xs font-semibold px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg uppercase tracking-wider">
                    {product.category}
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-500 line-clamp-2 mb-6 min-h-[40px]">
                {product.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <div className="flex items-center gap-1 text-zinc-900 font-bold text-xl">
                  <span className="text-sm font-medium text-zinc-400">₦</span>
                  {product.price.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
            <Package className="mx-auto text-zinc-200 mb-4" size={48} />
            <p className="text-zinc-400">No products found. Add your first item!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingProduct(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setIsAddingProduct(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    placeholder="e.g., Professional Consulting"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Price (₦)</label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                      placeholder="e.g., Services"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all min-h-[100px]"
                    placeholder="Describe the product or service..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold border border-zinc-200 hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                  >
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 size={20} className="text-emerald-400" />
            <span className="font-medium">Product saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => productToDelete && handleDelete(productToDelete)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
      />
    </div>
  );
}
