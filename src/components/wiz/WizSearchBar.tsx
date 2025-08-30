import { useState, useRef, useEffect } from 'react';
import { Search, X, User, Play, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { SearchService, SearchResult } from '@/lib/search-service';

interface WizSearchBarProps {
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const WizSearchBar = ({ 
  onSearch, 
  onResultSelect, 
  placeholder = "Search videos, creators...",
  className 
}: WizSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Debounced search effect
  useEffect(() => {
    if (query.length > 1) { // Start searching after 2 characters
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const searchResults = await SearchService.search(query, 8);
          setResults(searchResults);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300); // Slightly longer debounce for real search
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setSelectedIndex(-1);
      setLoading(false);
    }
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search bar on '/' key
      if (e.key === '/' && !isActive) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsActive(true);
      }
      
      // Handle escape key
      if (e.key === 'Escape' && isActive) {
        setQuery('');
        setIsActive(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // Handle input navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onResultSelect?.(results[selectedIndex]);
          handleClear();
        } else if (query.trim()) {
          onSearch?.(query.trim());
          handleClear();
        }
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    setIsActive(false);
    inputRef.current?.blur();
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    handleClear();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'creator': return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <motion.div
        className="relative"
        animate={{
          width: isMobile 
            ? (isActive ? '100%' : '100%') // Full width on mobile
            : (isActive ? 320 : 280), // Desktop sizing
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div
          className={cn(
            "relative h-10 rounded-full transition-all duration-200",
            "border-0 shadow-lg",
            isActive 
              ? "shadow-purple-500/25 ring-2 ring-purple-500/50" 
              : "shadow-black/10"
          )}
          style={{
            background: isActive 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: isActive 
              ? '0 0 20px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Search Icon - Enhanced for mobile */}
          <Search className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-200",
            isMobile ? "w-5 h-5" : "w-4 h-4",
            isActive && "text-purple-400"
          )} />
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsActive(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full h-full pl-12 pr-10 rounded-full",
              "bg-transparent text-white placeholder:text-gray-400",
              "border-0 outline-none text-sm font-medium",
              "selection:bg-purple-500/30"
            )}
          />
          
          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                         p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isActive && (loading || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-12 left-0 right-0 z-50 overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="max-h-80 overflow-y-auto py-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-400 text-sm">Searching...</span>
                </div>
              ) : (
                results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "flex items-center px-4 py-3 cursor-pointer transition-all duration-150",
                    "hover:bg-white/5",
                    selectedIndex === index && "bg-white/10"
                  )}
                >
                  {/* Result Icon/Thumbnail */}
                  <div className="flex-shrink-0 mr-3">
                    {result.type === 'video' && result.thumbnail ? (
                      <div className="w-10 h-6 rounded overflow-hidden bg-gray-700">
                        <img 
                          src={result.thumbnail} 
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : result.type === 'creator' && result.avatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={result.avatar} alt={result.title} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          {result.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        {getResultIcon(result.type)}
                      </div>
                    )}
                  </div>
                  
                  {/* Result Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <div className="text-white font-medium text-sm truncate">
                        {result.title}
                      </div>
                      {result.type === 'creator' && result.data && 'verified' in result.data && result.data.verified && (
                        <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    {result.subtitle && (
                      <div className="text-gray-400 text-xs truncate mt-0.5">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  
                  {/* Result Type Badge */}
                  <div className="flex-shrink-0 ml-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs border-gray-600 text-gray-400 bg-transparent"
                    >
                      {result.type}
                    </Badge>
                  </div>
                </motion.div>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div 
              className="border-t border-white/10 px-4 py-2 text-center"
              style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            >
              <span className="text-xs text-gray-400">
                Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> to search all results
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};