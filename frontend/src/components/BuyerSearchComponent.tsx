import React, { useState, useRef, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { buyerService } from '../services/buyerSrevice';

interface BuyerSearchResult {
  buyerName: string;
  transactionCount: number;
  totalSpent: number;
}

interface BuyerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const BuyerSearchInput: React.FC<BuyerSearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search or enter buyer name" 
}) => {
  const [searchResults, setSearchResults] = useState<BuyerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Search buyers as user types
  useEffect(() => {
    if (value.length < 2) {
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
        const data = await buyerService.search(value);
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
  }, [value]);

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

  const handleSelectBuyer = (buyerName: string) => {
    onChange(buyerName);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((buyer, index) => (
            <div
              key={index}
              onClick={() => handleSelectBuyer(buyer.buyerName)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-indigo-600" />
                    {buyer.buyerName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {buyer.transactionCount} {buyer.transactionCount === 1 ? 'transaction' : 'transactions'} • 
                    Total: ₱{buyer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  Select
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Buyer Indicator */}
      {value && !searchResults.some(r => r.buyerName.toLowerCase() === value.toLowerCase()) && !isSearching && value.length >= 2 && (
        <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
          <span>+</span>
          <span>New buyer will be created</span>
        </div>
      )}

      {/* Existing Buyer Indicator */}
      {searchResults.some(r => r.buyerName.toLowerCase() === value.toLowerCase()) && (
        <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <span>✓</span>
          <span>Existing buyer - transactions will be grouped</span>
        </div>
      )}
    </div>
  );
};

export default BuyerSearchInput;