import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Users, FileText, DollarSign, Briefcase, Clock, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'client' | 'invoice' | 'user' | 'project' | 'task' | 'contact';
  description?: string;
  icon?: React.ReactNode;
  href?: string;
}

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Global Header Search Modal
 * Searchable index of all major entities: clients, invoices, projects, users, tasks, contacts
 * Shows autocomplete results as user types
 */
export default function HeaderSearchModal({ isOpen, onClose }: HeaderSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Example data - TODO: Replace with actual API calls
  const allItems: SearchResult[] = [
    // Clients
    {
      id: 'cli_001',
      title: 'Acme Corporation',
      type: 'client',
      description: 'Tech solutions provider',
      icon: <Briefcase size={16} className="text-blue-500" />,
    },
    {
      id: 'cli_002',
      title: 'Global Retail Ltd',
      type: 'client',
      description: 'Retail and e-commerce',
      icon: <Briefcase size={16} className="text-blue-500" />,
    },

    // Invoices
    {
      id: 'inv_001',
      title: 'Invoice #INV-2024-001',
      type: 'invoice',
      description: 'Amount: $5,000 | Due: 2025-04-01',
      icon: <DollarSign size={16} className="text-green-500" />,
    },
    {
      id: 'inv_002',
      title: 'Invoice #INV-2024-002',
      type: 'invoice',
      description: 'Amount: $8,750 | Due: 2025-04-15',
      icon: <DollarSign size={16} className="text-green-500" />,
    },

    // Users
    {
      id: 'usr_001',
      title: 'John Kipchoge',
      type: 'user',
      description: 'CEO | john@example.com',
      icon: <Users size={16} className="text-purple-500" />,
    },
    {
      id: 'usr_002',
      title: 'Sarah Mwangi',
      type: 'user',
      description: 'Finance Manager | sarah@example.com',
      icon: <Users size={16} className="text-purple-500" />,
    },

    // Projects
    {
      id: 'prj_001',
      title: 'Q2 Product Launch',
      type: 'project',
      description: '12 tasks | 80% complete',
      icon: <TrendingUp size={16} className="text-orange-500" />,
    },
    {
      id: 'prj_002',
      title: 'Website Redesign',
      type: 'project',
      description: '8 tasks | 50% complete',
      icon: <TrendingUp size={16} className="text-orange-500" />,
    },

    // Tasks
    {
      id: 'tsk_001',
      title: 'Follow up with client',
      type: 'task',
      description: 'Due: 2025-03-28 | High priority',
      icon: <Clock size={16} className="text-red-500" />,
    },
    {
      id: 'tsk_002',
      title: 'Prepare monthly report',
      type: 'task',
      description: 'Due: 2025-04-05 | Medium priority',
      icon: <Clock size={16} className="text-red-500" />,
    },

    // Contacts
    {
      id: 'cnt_001',
      title: 'Jane Smith',
      type: 'contact',
      description: 'Contact | Acme Corporation | jane@acme.com',
      icon: <FileText size={16} className="text-pink-500" />,
    },
    {
      id: 'cnt_002',
      title: 'Mike Johnson',
      type: 'contact',
      description: 'Contact | Global Retail Ltd | mike@global.com',
      icon: <FileText size={16} className="text-pink-500" />,
    },
  ];

  // Perform search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase();

      // Filter and score results
      const filtered = allItems
        .filter(
          (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery) ||
            item.type.includes(lowerQuery)
        )
        .sort((a, b) => {
          // Score by relevance: title match > description match
          const aMatchesTitle = a.title.toLowerCase().includes(lowerQuery);
          const bMatchesTitle = b.title.toLowerCase().includes(lowerQuery);
          if (aMatchesTitle && !bMatchesTitle) return -1;
          if (!aMatchesTitle && bMatchesTitle) return 1;
          return 0;
        })
        .slice(0, 10); // Limit to top 10 results

      setResults(filtered);
      setSelectedIndex(0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // TODO: Route to the selected item
    console.log('Selected:', result);
    // Example: navigate(`/crm/clients/${result.id}`);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client: 'Client',
      invoice: 'Invoice',
      user: 'User',
      project: 'Project',
      task: 'Task',
      contact: 'Contact',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      client: 'bg-blue-100 text-blue-700',
      invoice: 'bg-green-100 text-green-700',
      user: 'bg-purple-100 text-purple-700',
      project: 'bg-orange-100 text-orange-700',
      task: 'bg-red-100 text-red-700',
      contact: 'bg-pink-100 text-pink-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        <div className="w-full max-w-2xl">
          {/* Search Input */}
          <div className="bg-white rounded-t-lg shadow-lg p-4 border-b">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search clients, invoices, projects, users, tasks..."
                className="flex-1 outline-none text-lg"
              />
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Tips */}
            {!query && (
              <div className="mt-4 p-2 bg-blue-50 rounded text-sm text-gray-600">
                💡 Try searching by: Client name, Invoice number, User name, Project title, or Task description
              </div>
            )}
          </div>

          {/* Results */}
          <div className="bg-white rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {query ? '❌ No results found' : '👋 Start typing to search'}
              </div>
            ) : (
              <div className="divide-y">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full text-left px-4 py-3 transition ${
                      index === selectedIndex
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="mt-1">{result.icon}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {result.title}
                          </p>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${getTypeColor(
                              result.type
                            )}`}
                          >
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-gray-300 mt-1">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Tips */}
          {results.length > 0 && (
            <div className="bg-gray-50 rounded-b-lg px-4 py-3 text-xs text-gray-500 border-t">
              <kbd className="px-2 py-1 bg-white border rounded text-gray-700">↑↓</kbd>
              <span className="mx-2">to navigate</span>
              <kbd className="px-2 py-1 bg-white border rounded text-gray-700">⏎</kbd>
              <span className="mx-2">to select</span>
              <kbd className="px-2 py-1 bg-white border rounded text-gray-700">Esc</kbd>
              <span className="mx-2">to close</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
