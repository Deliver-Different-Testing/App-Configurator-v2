import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

export interface ComboboxOption {
  id: string;
  label: string;
  sublabel?: string;
  status?: 'active' | 'inactive' | string;
  meta?: Record<string, string>;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: ComboboxOption | null;
  onChange: (option: ComboboxOption | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  maxResults?: number;
  disabled?: boolean;
  clearable?: boolean;
  /** When true, shows a simple search bar instead of displaying the selected value */
  searchBarMode?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  className = '',
  maxResults = 10,
  disabled = false,
  clearable = true,
  searchBarMode = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options.slice(0, maxResults);
    }

    const query = searchQuery.toLowerCase();
    return options
      .filter(option =>
        option.label.toLowerCase().includes(query) ||
        option.sublabel?.toLowerCase().includes(query) ||
        Object.values(option.meta || {}).some(v => v.toLowerCase().includes(query))
      )
      .slice(0, maxResults);
  }, [options, searchQuery, maxResults]);

  const handleSelect = (option: ComboboxOption) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Bar Mode - Simple search input */}
      {searchBarMode ? (
        <div className="relative">
          <Search className="absolute left-3 top-0 bottom-0 my-auto h-4 w-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-10 py-2 border-2 rounded-md transition-all duration-200
              ${disabled
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                : isOpen
                  ? 'border-brand-cyan shadow-cyan-glow bg-white focus:outline-none'
                  : 'border-border bg-white focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow'
              }
            `}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-0 bottom-0 my-auto h-4 w-4 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        /* Standard Mode - Trigger Button */
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left transition-all duration-200
            ${disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : isOpen
                ? 'border-brand-cyan shadow-cyan-glow bg-white'
                : 'border-border bg-white hover:border-gray-300'
            }
          `}
        >
          {value ? (
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-md bg-secondary-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {value.label.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-text-primary truncate">{value.label}</div>
                {value.sublabel && (
                  <div className="text-xs text-text-secondary truncate">{value.sublabel}</div>
                )}
              </div>
              {value.status && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0
                  ${value.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  {value.status}
                </span>
              )}
            </div>
          ) : (
            <span className="flex-1 text-text-muted">{placeholder}</span>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {value && clearable && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search Input - only show in standard mode (searchBarMode has it in the trigger) */}
          {!searchBarMode && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                      ${isSelected
                        ? 'bg-brand-cyan/10'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="w-8 h-8 rounded-md bg-secondary-purple/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {option.label.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isSelected ? 'text-brand-cyan' : 'text-text-primary'}`}>
                        {option.label}
                      </div>
                      {option.sublabel && (
                        <div className="text-xs text-text-secondary truncate">{option.sublabel}</div>
                      )}
                    </div>
                    {option.status && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0
                        ${option.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                      `}>
                        {option.status}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-text-muted">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{emptyMessage}</p>
                {searchQuery && (
                  <p className="text-xs mt-1">Try a different search term</p>
                )}
              </div>
            )}
          </div>

          {/* Footer hint */}
          {filteredOptions.length > 0 && options.length > maxResults && (
            <div className="px-3 py-2 border-t border-border bg-gray-50 text-xs text-text-muted">
              Showing {filteredOptions.length} of {options.length} results. Type to search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
