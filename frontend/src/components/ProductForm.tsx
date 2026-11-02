import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Product } from '../types';

interface ProductFormProps {
  onAddProduct: (name: string, price: number, stock: number, note?: string) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    stock: '',
    note: '' 
  });
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null); // Fixed type

  // Search products as user types
  useEffect(() => {
    if (formData.name.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current !== null) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `http://localhost:8000/api/products/search?name=${encodeURIComponent(formData.name)}`
        );
        const data = await response.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current !== null) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [formData.name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      name: product.name,
      price: product.price.toString()
    });
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (formData.name && formData.price && formData.stock) {
      await onAddProduct(
        formData.name, 
        parseFloat(formData.price), 
        parseInt(formData.stock),
        formData.note || undefined
      );
      
      // Reset form
      setFormData({ name: '', price: '', stock: '', note: '' });
      setSelectedProduct(null);
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
    setSelectedProduct(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Plus className="text-indigo-600" />
        Add Product / Restock
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Product Name - Search & Select */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Product Name
            <span className="text-gray-500 ml-1">(Search or create new)</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search or enter new product"
              value={formData.name}
              onChange={handleNameChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    ₱{product.price.toFixed(2)} • Current stock: {product.stock}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Selected Product Indicator */}
          {selectedProduct && (
            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
              <span>✓</span>
              <span>Existing product - Adding to current stock: {selectedProduct.stock}</span>
            </div>
          )}

          {/* New Product Indicator */}
          {formData.name && !selectedProduct && searchResults.length === 0 && !isSearching && (
            <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
              <span>+</span>
              <span>New product will be created</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Price (₱)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Stock to Add
          </label>
          <input
            type="number"
            placeholder="Quantity"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. From Supplier A"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.price || !formData.stock}
          className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {selectedProduct ? 'Add Stock to Existing Product' : 'Create New Product'}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;