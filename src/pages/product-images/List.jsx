import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  getProductImagesByProductId, 
  createProductImage, 
  updateProductImage, 
  deleteProductImage,
  setPrimaryImage 
} from '@/lib/productImageApi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ProductImageForm from '@/components/product-images/ProductImageForm';
import { toast } from 'react-hot-toast';

export default function ProductImagesList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-dropdown')) {
        setShowProductDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products-dropdown'],
    queryFn: async () => {
      return (await api.get('/products/get.php', { params: { limit: 1000 } })).data;
    },
    refetchOnWindowFocus: false
  });
  
  const products = productsData?.data || [];
  
  // Get selected product name
  const selectedProduct = products.find(p => p.id == productId);
  
  // Initialize product search with selected product name
  useEffect(() => {
    if (selectedProduct && !productSearch) {
      setProductSearch(selectedProduct.name);
    }
  }, [selectedProduct, productSearch]);

  // Fetch product images
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      if (!productId) return { success: true, data: [] };
      return await getProductImagesByProductId(productId);
    },
    enabled: !!productId,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: createProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images']);
      toast.success('Product image created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to create product image';
      toast.error(message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateProductImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images']);
      toast.success('Product image updated successfully');
      setIsModalOpen(false);
      setSelectedImage(null);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to update product image';
      toast.error(message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images']);
      toast.success('Product image deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedImage(null);
    },
    onError: () => {
      toast.error('Failed to delete product image');
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: setPrimaryImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images']);
      toast.success('Primary image updated successfully');
    },
    onError: () => {
      toast.error('Failed to set primary image');
    }
  });

  const handleSubmit = (formData) => {
    if (!formData) {
      setIsModalOpen(false);
      setSelectedImage(null);
      return;
    }

    if (selectedImage) {
      updateMutation.mutate({ ...formData, id: selectedImage.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleDelete = (image) => {
    setSelectedImage(image);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedImage) {
      deleteMutation.mutate(selectedImage.id);
    }
  };

  const handleSetPrimary = (imageId) => {
    setPrimaryMutation.mutate(imageId);
  };

  const images = data?.data || [];
  
  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.type && product.type.toLowerCase().includes(productSearch.toLowerCase()))
  );
  
  const handleProductSelect = (product) => {
    setProductId(product.id);
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };
  
  const handleProductSearchChange = (e) => {
    setProductSearch(e.target.value);
    setShowProductDropdown(true);
    setSelectedIndex(-1);
    if (!e.target.value) {
      setProductId('');
    }
  };
  
  const handleClearSelection = () => {
    setProductId('');
    setProductSearch('');
    setShowProductDropdown(false);
    setSelectedIndex(-1);
  };
  
  const handleKeyDown = (e) => {
    if (!showProductDropdown) return;
    
    const visibleProducts = filteredProducts.slice(0, 50);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < visibleProducts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : visibleProducts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && visibleProducts[selectedIndex]) {
          handleProductSelect(visibleProducts[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowProductDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Images</h1>
          <p className="text-gray-600">Manage product images and their display order</p>
        </div>
        <Button
          onClick={() => {
            setSelectedImage(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
          disabled={!productId}
        >
          ➕ Add Image
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative product-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <div className="relative">
              <input
                 type="text"
                 value={productSearch}
                 onChange={handleProductSearchChange}
                 onFocus={() => setShowProductDropdown(true)}
                 onKeyDown={handleKeyDown}
                 placeholder="Search products by name or type..."
                 className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                 autoComplete="off"
               />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                 {productSearch && (
                   <button
                     type="button"
                     onClick={handleClearSelection}
                     className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                   >
                     <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 )}
                 <svg className="h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
              
              {/* Dropdown */}
               {showProductDropdown && filteredProducts.length > 0 && (
                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                   {filteredProducts.slice(0, 50).map((product, index) => (
                     <div
                       key={product.id}
                       onClick={() => handleProductSelect(product)}
                       className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                         index === selectedIndex 
                           ? 'bg-cyan-100 text-cyan-900' 
                           : 'hover:bg-gray-100'
                       }`}
                     >
                       <div className="font-medium">{product.name}</div>
                       {product.type && (
                         <div className={`text-sm ${
                           index === selectedIndex ? 'text-cyan-700' : 'text-gray-500'
                         }`}>Type: {product.type}</div>
                       )}
                       {product.category_name && (
                         <div className={`text-xs ${
                           index === selectedIndex ? 'text-cyan-600' : 'text-gray-400'
                         }`}>Category: {product.category_name}</div>
                       )}
                     </div>
                   ))}
                  {filteredProducts.length > 50 && (
                    <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                      Showing first 50 results. Type more to narrow down.
                    </div>
                  )}
                </div>
              )}
              
              {/* No results */}
              {showProductDropdown && productSearch && filteredProducts.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-gray-500">No products found</div>
                </div>
              )}
            </div>
            
            {/* Selected product info */}
            {selectedProduct && (
              <div className="mt-2 p-2 bg-cyan-50 border border-cyan-200 rounded-md">
                <div className="text-sm font-medium text-cyan-900">Selected: {selectedProduct.name}</div>
                {selectedProduct.type && (
                  <div className="text-xs text-cyan-700">Type: {selectedProduct.type}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">Error loading product images. Please try again.</p>
        </div>
      )}

      {/* No Product Selected */}
      {!productId && !isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">Please select a product to view its images</p>
        </div>
      )}

      {/* Images Grid */}
      {productId && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {images.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No images found for this product</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.image_full_url || image.image_url}
                      alt="Product image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  
                  {/* Primary Badge */}
                  {image.is_primary == 1 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Primary
                    </div>
                  )}
                  
                  {/* Display Order */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Order: {image.display_order}
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {image.is_primary != 1 && (
                        <Button
                          onClick={() => handleSetPrimary(image.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEdit(image)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(image)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImage(null);
        }}
        title={selectedImage ? 'Edit Product Image' : 'Add Product Image'}
      >
        <ProductImageForm
          image={selectedImage}
          productId={productId}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedImage(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedImage(null);
        }}
        title="Delete Product Image"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this product image? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedImage(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}