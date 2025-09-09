import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'react-hot-toast';

export default function ProductsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', page, debouncedSearch.trim()],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      return (await api.get('/products/get.php', { params })).data;
    },
    enabled: true,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Handle FormData for file uploads
      const config = data instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};
      return api.post('/products/create.php', data, config);
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
      // Handle FormData for file uploads
      const config = data instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};
      return api.post('/products/update.php', data, config);
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
    mutationFn: (id) => api.post('/products/delete.php', { id }),
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

  console.log("data");
  console.log(data);
  
  const products = data?.data || [];
  const totalPages = data?.pagination?.total_pages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
  };

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
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex">
              <input 
                name="search"
                type="text" 
                value={search}
                onChange={handleSearchInputChange}
                placeholder="Search products..." 
                className="rounded-l-md border px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400"
              />
              <button 
                type="submit"
                className="rounded-r-md bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300"
              >
                🔍
              </button>
            </form>
            <Button onClick={() => setIsModalOpen(true)}>
              Add Product
            </Button>
          </div>
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
                        <div className="text-xs text-red-600 line-through">${product.discount_price}</div>
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