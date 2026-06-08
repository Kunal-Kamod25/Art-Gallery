'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import ArtworkCard from '../../components/gallery/ArtworkCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

function GalleryContent() {
  const searchParams = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    artist: searchParams.get('artist') || '',
    minPrice: '',
    maxPrice: '',
    search: searchParams.get('search') || '',
    sort: 'newest',
    featured: searchParams.get('featured') || '',
  });

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
      const res = await api.get(`/artworks?${params}`);
      setArtworks(res.data.artworks);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
    api.get('/artists?limit=50').then(r => setArtists(r.data.artists));
  }, []);

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', artist: '', minPrice: '', maxPrice: '', search: '', sort: 'newest', featured: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.category || filters.artist || filters.minPrice || filters.maxPrice || filters.search || filters.featured;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-20 text-center">
        <p className="text-amber-400 tracking-[0.3em] text-xs uppercase mb-3">Our Collection</p>
        <h1 className="font-display text-5xl font-bold">The Gallery</h1>
        <p className="text-neutral-400 mt-3 text-sm">{total} works available</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-900 hover:text-white transition-all">
              <SlidersHorizontal size={16} /> Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
                <X size={14} /> Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Sort by:</span>
            <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="bg-white border border-neutral-200 p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 block mb-2">Category</label>
              <select value={filters.category} onChange={e => updateFilter('category', e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 block mb-2">Artist</label>
              <select value={filters.artist} onChange={e => updateFilter('artist', e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900">
                <option value="">All Artists</option>
                {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 block mb-2">Min Price ($)</label>
              <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                placeholder="0" className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 block mb-2">Max Price ($)</label>
              <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                placeholder="Any" className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white animate-pulse">
                <div className="aspect-[4/5] bg-neutral-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-neutral-200 w-1/2 rounded" />
                  <div className="h-5 bg-neutral-200 rounded" />
                  <div className="h-3 bg-neutral-200 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-neutral-300 mb-3">No artworks found</p>
            <p className="text-neutral-400 text-sm mb-6">Try adjusting your filters</p>
            <button onClick={clearFilters} className="btn-outline text-sm tracking-widest uppercase">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {artworks.map(a => <ArtworkCard key={a._id} artwork={a} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-10 h-10 text-sm font-medium transition-all ${page === i + 1 ? 'bg-neutral-900 text-white' : 'border border-neutral-300 hover:border-neutral-900'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
