import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getProductTags, getAllProductTags, createProductTag, updateProductTag, deleteProductTag, getProductTagsWithDetails } from '@/lib/productTagApi';
import { getProducts } from '@/lib/productApi';
import { getTags } from '@/lib/tagApi';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProductTagForm from '@/components/product-tags/ProductTagForm';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function ProductTagsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductTag, setEditingProductTag] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductTag, setDeletingProductTag] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch product tags
  const { data: productTagsData, isLoading, error } = useQuery({
    queryKey: ['product-tags', currentPage, debouncedSearch, selectedProduct, selectedTag, showDetails],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (debouncedSearch) params.q = debouncedSearch;
      if (selectedProduct) params.product_id = selectedProduct;
      if (selectedTag) params.tag_id = selectedTag;
      
      // If no filters are applied, use getAllProductTags
      if (!selectedProduct && !selectedTag && !debouncedSearch) {
        return await getAllProductTags(params);
      }
      
      if (showDetails) {
        return await getProductTagsWithDetails(params);
      } else {
        return await getProductTags(params);
      }
    }
  });

  // Fetch products for filter dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products-for-filter'],
    queryFn: async () => {
      return await getProducts({ limit: 100, is_active: 1 });
    }
  });

  // Fetch tags for filter dropdown
  const { data: tagsData } = useQuery({
    queryKey: ['tags-for-filter'],
    queryFn: async () => {
      return await getTags({ limit: 100 });
    }
  });

  const productTags = productTagsData?.data || [];
  const totalPages = Math.ceil((productTagsData?.total || 0) / itemsPerPage);
  const products = productsData?.data || [];
  const tags = tagsData?.data || [];

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (productTagData) => {
      return await createProductTag(productTagData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-tags'] });
      toast.success('Product tag created successfully!');
      setIsModalOpen(false);
      setEditingProductTag(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product tag');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, productTagData }) => {
      return await updateProductTag(id, productTagData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-tags'] });
      toast.success('Product tag updated successfully!');
      setIsModalOpen(false);
      setEditingProductTag(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product tag');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteProductTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-tags'] });
      toast.success('Product tag deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingProductTag(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product tag');
    },
  });

  const handleEdit = (productTag) => {
    setEditingProductTag(productTag);
    setIsModalOpen(true);
  };

  const handleDelete = (productTag) => {
    setDeletingProductTag(productTag);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (productTagData) => {
    if (editingProductTag) {
      updateMutation.mutate({ id: editingProductTag.id, productTagData });
    } else {
      createMutation.mutate(productTagData);
    }
  };

  const confirmDelete = () => {
    if (deletingProductTag) {
      deleteMutation.mutate(deletingProductTag.id);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleProductFilterChange = (e) => {
    setSelectedProduct(e.target.value);
    setCurrentPage(1);
  };

  const handleTagFilterChange = (e) => {
    setSelectedTag(e.target.value);
    setCurrentPage(1);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading product tags: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Tags</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product Tag
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Search product tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={handleProductFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <select
              value={selectedTag}
              onChange={handleTagFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={toggleDetails}
              variant={showDetails ? 'primary' : 'secondary'}
              className="w-full"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Tags Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tag
              </th>
              {showDetails && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag Details
                  </th>
                </>
              )}
             
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productTags.map((productTag, index) => (
              <tr key={`${productTag.product_id}-${productTag.tag_id}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <p className="font-medium">{productTag.product_name || `Product ID: ${productTag.product_id}`}</p>
                    {productTag.product_price && (
                      <p className="text-sm text-gray-500">${productTag.product_price}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {productTag.tag_name || `Tag ID: ${productTag.tag_id}`}
                    </span>
                    {productTag.tag_slug && (
                      <p className="text-xs text-gray-500 mt-1">/{productTag.tag_slug}</p>
                    )}
                  </div>
                </td>
                {showDetails && (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {productTag.product && (
                        <div>
                          <p className="font-medium">{productTag.product.name}</p>
                          <p className="text-gray-500">{productTag.product.description?.substring(0, 50)}...</p>
                          <p className="text-sm text-gray-400">Price: ${productTag.product.price}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {productTag.tag && (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {productTag.tag.name}
                          </span>
                          {productTag.tag.description && (
                            <p className="text-gray-500 mt-1">{productTag.tag.description}</p>
                          )}
                        </div>
                      )}
                    </td>
                  </>
                )}
               
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    onClick={() => handleEdit(productTag)}
                    size="sm"
                    variant="secondary"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(productTag)}
                    size="sm"
                    variant="danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productTags.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No product tags found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="secondary"
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              variant={currentPage === page ? 'primary' : 'secondary'}
            >
              {page}
            </Button>
          ))}
          
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProductTag(null);
        }}
        title={editingProductTag ? 'Edit Product Tag' : 'Add Product Tag'}
      >
        <ProductTagForm
          productTag={editingProductTag}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProductTag(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          products={products}
          tags={tags}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProductTag(null);
        }}
        title="Delete Product Tag"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this product tag relationship? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingProductTag(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="danger"
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