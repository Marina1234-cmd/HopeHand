import { useState, useEffect } from 'react'
import '../styles/effects.css'

interface SearchFiltersProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
  selectedCategory: string
}

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'education', name: 'Education' },
  { id: 'medical', name: 'Medical' },
  { id: 'environment', name: 'Environment' },
  { id: 'community', name: 'Community' },
  { id: 'technology', name: 'Technology' },
  { id: 'creative', name: 'Creative' },
  { id: 'emergency', name: 'Emergency' }
]

const SearchFilters = ({ onSearch, onCategoryChange, selectedCategory }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className={`relative input-focus-effect rounded-lg transition-shadow ${
        isSearchFocused ? 'shadow-lg' : 'shadow-md'
      }`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={`h-5 w-5 transition-colors ${
              isSearchFocused ? 'text-primary-600' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex flex-nowrap gap-2 min-w-max sm:flex-wrap sm:min-w-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`category-btn px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white transform scale-105 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="block sm:hidden">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full w-1/3"></div>
        </div>
      </div>
    </div>
  )
}

export default SearchFilters 