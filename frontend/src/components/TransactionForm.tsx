import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { Product, TransactionFormProps } from '../types';
import BuyerSearchInput from './BuyerSearchComponent';

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  products, 
  onAddToCart, 
  buyerName, 
  onBuyerNameChange,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Filter products based on search term
  const filteredProducts = products
    .filter((p) => p.stock > 0)
    .filter((p) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.price.toString().includes(searchTerm)
    );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered products change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  
  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedProduct(null);
    setIsDropdownOpen(true);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedProduct(null);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleAddToCart = () => {
    if (selectedProduct && quantity > 0 && quantity <= selectedProduct.stock) {
      onAddToCart({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        price: selectedProduct.price
     
      });
      setQuantity(1);
      setSelectedProduct(null);
      setSearchTerm('');
      inputRef.current?.focus();
    } else if (selectedProduct && quantity > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} units available!`);
    } else {
      alert('Please select a product');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredProducts[highlightedIndex]) {
          handleSelectProduct(filteredProducts[highlightedIndex]);
        } else if (selectedProduct) {
          handleAddToCart();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">New Transaction</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buyer Name
          <span className="text-gray-500 ml-1">(Search existing or create new)</span>
        </label>
        <BuyerSearchInput
          value={buyerName}
          onChange={onBuyerNameChange}
          placeholder="Search or enter buyer name"
        />
      </div>

      <div className="mb-4 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Product
          <span className="text-xs text-gray-500 ml-2">(Use ↑↓ arrows to navigate)</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search by product name or price..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    highlightedIndex === index 
                      ? 'bg-indigo-100' 
                      : 'hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        ₱{product.price.toFixed(2)} • {product.stock} in stock
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stock < 10 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} left
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                {searchTerm ? 'No products found' : 'Start typing to search...'}
              </div>
            )}
          </div>
        )}

        {/* Selected Product Display */}
        {selectedProduct && !isDropdownOpen && (
          <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-indigo-900">{selectedProduct.name}</p>
                <p className="text-sm text-indigo-600">
                  ₱{selectedProduct.price.toFixed(2)} • {selectedProduct.stock} available
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <input
          type="number"
          min="1"
          max={selectedProduct?.stock || 1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {selectedProduct && (
          <p className="text-xs text-gray-500 mt-1">
            Max: {selectedProduct.stock} units available
          </p>
        )}
      </div>


      <button
        onClick={handleAddToCart}
        disabled={!selectedProduct}
        className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>Add to Cart</span>
        {selectedProduct && (
          <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded">
            Press Enter
          </span>
        )}
      </button>
    </div>
  );
};

export default TransactionForm;