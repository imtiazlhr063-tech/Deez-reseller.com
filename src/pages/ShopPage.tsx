import React, { useState, useEffect } from 'react';
import { Product, CategoryConfig } from '../types/store';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ShopPageProps {
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onSelectProduct }) => {
  const { lang, t, referralCode } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'all';
  });
  const [sort, setSort] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/public/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/public/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed fetching shop products', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (onlyInStock && p.stock <= 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.titleUrdu && p.titleUrdu.includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7E2DA] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
            DEEZ Online Store
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-stone-900 mt-1">
            {lang === 'ur' ? 'دیز کاسمیٹکس کی تمام مصنوعات' : 'Cosmetics & Personal Care Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Transparent soaps, face washes, scrubs, serums, and personal care. 100% Cash on Delivery across Pakistan.
          </p>
        </div>

        {referralCode && (
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <span className="font-semibold">Reseller Referral Active:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-bold">{referralCode}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transparent soaps, face wash, scrubs, kajal..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
            >
              <option value="all">{lang === 'ur' ? 'تمام کیٹیگریز' : 'All Categories'} ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {lang === 'ur' && c.nameUrdu ? c.nameUrdu : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* In-Stock Filter Toggle */}
          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="rounded border-[#DDD6CC] text-[#8C6D46] focus:ring-[#8C6D46]"
              />
              <span>In-stock only</span>
            </label>
          </div>
        </div>

        {/* Horizontal Category Quick Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 text-xs">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              category === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EDE8E0]'
            }`}
          >
            All Products
          </button>
          {categories.slice(0, 10).map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                category === c.slug
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EDE8E0]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-[#E7E2DA] h-84 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E7E2DA] space-y-2">
          <p className="text-base font-semibold text-stone-800">No products found in this category.</p>
          <p className="text-xs text-stone-500">
            Products added by the admin in the DEEZ Control Panel will appear here automatically.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('all');
              setSort('featured');
              setOnlyInStock(false);
            }}
            className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
