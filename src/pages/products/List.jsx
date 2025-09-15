import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/productApi';
import { searchBrands } from '@/lib/brandApi';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'react-hot-toast';

export default function ProductsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    min_price: '',
    max_price: '',
    is_active: '',
    is_featured: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [debouncedBrandSearch, setDebouncedBrandSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', page, debouncedSearch.trim(), filters],
    queryFn: async () => {
      const params = { page, limit: 10 };
      
      // Add search query if provided
      if (debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
      }
      
      // Add filters
      if (filters.type) params.type = filters.type;
      if (filters.brand) params.brand = filters.brand;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
  
      if (filters.is_active !== '') params.is_active = filters.is_active;
      if (filters.is_featured !== '') params.is_featured = filters.is_featured;
      
      // Use unified products API
      return await getProducts(params);
    },
    enabled: true,
    refetchOnWindowFocus: false
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data) => {
      return createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to create product';
      toast.error(message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      return updateProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product updated successfully');
      setIsModalOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to update product';
      toast.error(message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error('Failed to delete product');
    }
  });

  // Handle form submission
  const handleSubmit = (formData) => {
    if (!formData) {
      setIsModalOpen(false);
      setSelectedProduct(null);
      return;
    }

    if (selectedProduct) {
      // Handle FormData for updates
      if (formData instanceof FormData) {
        formData.append('id', selectedProduct.id);
        updateMutation.mutate(formData);
      } else {
        updateMutation.mutate({ ...formData, id: selectedProduct.id });
      }
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      type: '',
      brand: '',
      min_price: '',
      max_price: '',
   
      is_active: '',
      is_featured: ''
    });
    setSearch('');
    setBrandSearch('');
    setShowBrandDropdown(false);
    setPage(1);
  };

  const handleBrandSelect = (brand) => {
    handleFilterChange('brand', brand.name);
    setBrandSearch(brand.name);
    setShowBrandDropdown(false);
  };

  const handleBrandInputChange = (e) => {
    const value = e.target.value;
    setBrandSearch(value);
    handleFilterChange('brand', value);
    setShowBrandDropdown(value.length > 0);
  };
  
  const hasActiveFilters = filters.type || filters.brand || filters.min_price || filters.max_price || filters.is_active !== '' || filters.is_featured !== '' || search;

  // Brand search query
  const { data: brandSuggestions = [] } = useQuery({
    queryKey: ['brands', debouncedBrandSearch],
    queryFn: () => searchBrands(debouncedBrandSearch),
    enabled: debouncedBrandSearch.length > 0,
    select: (data) => data?.data.filter(brand => brand.is_active === 1) || []
  });

  // Debounce brand search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedBrandSearch(brandSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [brandSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.brand-filter-container')) {
        setShowBrandDropdown(false);
      }
    };
    
    if (showBrandDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBrandDropdown]);

  // Pagination
  const allProducts = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  
  // Client-side filtering for name, model, and SKU
  const [productSearch, setProductSearch] = useState('');
  
  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    (product.model && product.model.toLowerCase().includes(productSearch.toLowerCase())) || 
    (product.sku && product.sku.toLowerCase().includes(productSearch.toLowerCase())) 
  );
  
  const products = filteredProducts;

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);



  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold">Products</h2>
            <div className="flex gap-2">
              
              <input 
                type="text" 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Filter by name, model, or SKU..." 
                className="rounded-md border px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 min-w-[250px]"
              />
              <Button 
                variant="secondary" 
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? 'bg-blue-100 text-blue-700' : ''}
              >
                 Filters {hasActiveFilters && '●'}
              </Button>
              <Button onClick={() => setIsModalOpen(true)} >
                Add Product
              </Button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="videography">Videography</option>
                    <option value="photography">Photography</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                
                <div className="relative brand-filter-container">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brandSearch || filters.brand}
                    onChange={handleBrandInputChange}
                    onFocus={() => setShowBrandDropdown(brandSearch.length > 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowBrandDropdown(false);
                      }
                    }}
                    placeholder="Search brands..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  />
                  
                  {/* Brand Dropdown */}
                  {showBrandDropdown && brandSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {brandSuggestions.slice(0, 10).map((brand) => (
                        <div
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">{brand.name}</div>
                            {brand.description && (
                              <div className="text-xs text-gray-500 truncate">{brand.description}</div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            brand.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Clear brand filter */}
                  {filters.brand && (
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterChange('brand', '');
                        setBrandSearch('');
                        setShowBrandDropdown(false);
                      }}
                      className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    placeholder="No limit"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  />
                </div>
                
             
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.is_active}
                    onChange={(e) => handleFilterChange('is_active', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                  <select
                    value={filters.is_featured}
                    onChange={(e) => handleFilterChange('is_featured', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  >
                    <option value="">All Products</option>
                    <option value="1">Featured Only</option>
                    <option value="0">Non-Featured</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-md bg-gray-200" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-3 text-red-700">
            Failed to load products. Please try again.
            <div className="text-xs mt-1 text-red-600">
              {error?.response?.data?.error || error?.message || 'Unknown error'}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No products found. {search && 'Try a different search term.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-2 pr-2">ID</th>
                  <th className="pb-2 px-2">Image</th>
                  <th className="pb-2 px-2">Name</th>
                  <th className="pb-2 px-2">Subcategory</th>
                  <th className="pb-2 px-2">Type</th>
                  <th className="pb-2 px-2">Brand</th>
                  <th className="pb-2 px-2">Price</th>
                  <th className="pb-2 px-2">Featured</th>
                  <th className="pb-2 px-2">Status</th>
                  <th className="pb-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-2 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-2">
                      {product.primary_image_url ? (
                        <img 
                          src={product.primary_image_url.startsWith('http') ? product.primary_image_url : `http://localhost/api${product.primary_image_url}`} 
                          alt={product.name}
                          className="size-10 rounded object-cover bg-gray-100"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="size-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs" style={{display: product.primary_image_url ? 'none' : 'flex'}}>
                        📷
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.model && <span>Model: {product.model}</span>}
                        {product.model && product.sku && <span> • </span>}
                        {product.sku && <span>SKU: {product.sku}</span>}
                        {!product.model && !product.sku && <span>No model/SKU</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">{product.subcategory_name || '-'}</div>
                      {product.category_name && (
                        <div className="text-xs text-gray-500">({product.category_name})</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`inline-block rounded px-2 py-1 text-xs ${
                        product.type === 'videography' ? 'bg-blue-100 text-blue-800' :
                        product.type === 'photography' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {product.type === 'videography' ? '🎥 Video' :
                         product.type === 'photography' ? '📸 Photo' : '🎬 Both'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm">{product.brand || '-'}</td>
                  
                    <td className="py-3 px-2 text-sm">
                      <div className="font-medium">${product.price}</div>
                      {product.discount_price && (
                        <div className="text-xs text-red-600 line-through">%{product.discount_price}</div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {product.is_featured ? (
                        <span className="inline-block rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleEdit(product)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => handleDelete(product)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          initialData={selectedProduct}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedProduct && deleteMutation.mutate(selectedProduct.id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}