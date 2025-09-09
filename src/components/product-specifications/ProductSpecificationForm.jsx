import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/productApi';
import Button from '../ui/Button';

export default function ProductSpecificationForm({ onSubmit, initialData, isSubmitting, selectedProductId }) {
  const [formData, setFormData] = useState({
    product_id: selectedProductId || initialData?.product_id || '',
    spec_name: initialData?.spec_name || '',
    spec_value: initialData?.spec_value || '',
    spec_group: initialData?.spec_group || '',
    display_order: initialData?.display_order || ''
  });

  const [errors, setErrors] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products', { limit: 1000 }],
    queryFn: () => getProducts({ limit: 1000 })
  });

  const products = productsData?.data || [];
  const selectedProduct = products.find(p => p.id == formData.product_id);

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.model && product.model.toLowerCase().includes(productSearch.toLowerCase())) ||
    (product.sku && product.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Update form data when initialData or selectedProductId changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        product_id: initialData.product_id || '',
        spec_name: initialData.spec_name || '',
        spec_value: initialData.spec_value || '',
        spec_group: initialData.spec_group || '',
        display_order: initialData.display_order || ''
      });
    } else if (selectedProductId) {
      setFormData(prev => ({
        ...prev,
        product_id: selectedProductId
      }));
    }
  }, [initialData, selectedProductId]);

  // Initialize product search with selected product name
  useEffect(() => {
    if (selectedProduct && !productSearch) {
      setProductSearch(selectedProduct.name);
    }
  }, [selectedProduct, productSearch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-dropdown')) {
        setShowProductDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (showProductDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProductDropdown]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.spec_name.trim()) {
      newErrors.spec_name = 'Specification name is required';
    }

    if (!formData.spec_value.trim()) {
      newErrors.spec_value = 'Specification value is required';
    }

    if (formData.display_order && isNaN(Number(formData.display_order))) {
      newErrors.display_order = 'Display order must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        product_id: parseInt(formData.product_id),
        display_order: formData.display_order ? parseInt(formData.display_order) : undefined
      };
      onSubmit(submitData);
    }
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({ ...prev, product_id: product.id }));
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setSelectedIndex(-1);
    if (errors.product_id) {
      setErrors(prev => ({ ...prev, product_id: '' }));
    }
  };

  const handleProductSearchChange = (e) => {
    setProductSearch(e.target.value);
    setShowProductDropdown(true);
    setSelectedIndex(-1);
  };

  const handleClearSelection = () => {
    setFormData(prev => ({ ...prev, product_id: '' }));
    setProductSearch('');
    setShowProductDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showProductDropdown || filteredProducts.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredProducts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
          handleProductSelect(filteredProducts[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowProductDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Selection */}
      <div className="product-dropdown">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product *
        </label>
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={handleProductSearchChange}
              onFocus={() => setShowProductDropdown(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              placeholder="Search products..."
              className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm pr-20 ${
                errors.product_id ? 'border-red-300' : ''
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
              {productSearch && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          {showProductDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                      index === selectedIndex ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className={`text-xs ${
                      index === selectedIndex ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {product.model && <span>Model: {product.model}</span>}
                      {product.model && product.sku && <span> • </span>}
                      {product.sku && <span>SKU: {product.sku}</span>}
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        product.type === 'videography' ? 'bg-blue-100 text-blue-800' :
                        product.type === 'photography' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {product.type === 'videography' ? '🎥' :
                         product.type === 'photography' ? '📸' : '🎬'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
        {errors.product_id && (
          <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>
        )}

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="mt-2 p-2 bg-gray-50 rounded border text-sm">
            <div className="font-medium">{selectedProduct.name}</div>
            <div className="text-gray-600">
              {selectedProduct.model && <span>Model: {selectedProduct.model}</span>}
              {selectedProduct.model && selectedProduct.sku && <span> • </span>}
              {selectedProduct.sku && <span>SKU: {selectedProduct.sku}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Specification Name */}
      <div>
        <label htmlFor="spec_name" className="block text-sm font-medium text-gray-700 mb-1">
          Specification Name *
        </label>
        <input
          type="text"
          id="spec_name"
          name="spec_name"
          value={formData.spec_name}
          onChange={handleChange}
          placeholder="e.g., Weight, Dimensions, Battery Life"
          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm ${
            errors.spec_name ? 'border-red-300' : ''
          }`}
        />
        {errors.spec_name && (
          <p className="mt-1 text-sm text-red-600">{errors.spec_name}</p>
        )}
      </div>

      {/* Specification Value */}
      <div>
        <label htmlFor="spec_value" className="block text-sm font-medium text-gray-700 mb-1">
          Specification Value *
        </label>
        <input
          type="text"
          id="spec_value"
          name="spec_value"
          value={formData.spec_value}
          onChange={handleChange}
          placeholder="e.g., 2.5 kg, 150 x 100 x 75 mm, 8 hours"
          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm ${
            errors.spec_value ? 'border-red-300' : ''
          }`}
        />
        {errors.spec_value && (
          <p className="mt-1 text-sm text-red-600">{errors.spec_value}</p>
        )}
      </div>

      {/* Specification Group */}
      <div>
        <label htmlFor="spec_group" className="block text-sm font-medium text-gray-700 mb-1">
          Specification Group
        </label>
        <input
          type="text"
          id="spec_group"
          name="spec_group"
          value={formData.spec_group}
          onChange={handleChange}
          placeholder="e.g., Physical, Performance, Connectivity (optional)"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          Group related specifications together for better organization
        </p>
      </div>

      {/* Display Order */}
      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          id="display_order"
          name="display_order"
          value={formData.display_order}
          onChange={handleChange}
          min="0"
          placeholder="0"
          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm ${
            errors.display_order ? 'border-red-300' : ''
          }`}
        />
        {errors.display_order && (
          <p className="mt-1 text-sm text-red-600">{errors.display_order}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first. Leave as 0 to auto-assign.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}