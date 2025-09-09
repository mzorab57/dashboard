import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getProductSpecificationsByProductId,
  createProductSpecification,
  updateProductSpecification,
  deleteProductSpecification
} from '@/lib/productSpecificationApi';
import { getProducts } from '@/lib/productApi';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProductSpecificationForm from '@/components/product-specifications/ProductSpecificationForm';

export default function ProductSpecificationsList() {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSpecification, setSelectedSpecification] = useState(null);

  const queryClient = useQueryClient();

  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products', { limit: 1000 }],
    queryFn: () => getProducts({ limit: 1000 })
  });

  const products = productsData?.data || [];
  const selectedProduct = products.find(p => p.id == selectedProductId);

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.model && product.model.toLowerCase().includes(productSearch.toLowerCase())) ||
    (product.sku && product.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Fetch specifications for selected product
  const { data: specificationsData, isLoading } = useQuery({
    queryKey: ['product-specifications', selectedProductId],
    queryFn: () => getProductSpecificationsByProductId(selectedProductId),
    enabled: !!selectedProductId
  });

  const specifications = specificationsData?.data || [];

  // Filter specifications based on search and group
  const filteredSpecifications = specifications.filter(spec => {
    const matchesSearch = !searchTerm || 
      spec.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.spec_value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = !selectedGroup || 
      (spec.spec_group || '').toLowerCase() === selectedGroup.toLowerCase();
    
    return matchesSearch && matchesGroup;
  });

  // Get unique groups for filter
  const groups = [...new Set(specifications.map(spec => spec.spec_group).filter(Boolean))];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProductSpecification,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-specifications', selectedProductId]);
      toast.success('Specification created successfully!');
      setIsModalOpen(false);
      setSelectedSpecification(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create specification');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateProductSpecification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-specifications', selectedProductId]);
      toast.success('Specification updated successfully!');
      setIsModalOpen(false);
      setSelectedSpecification(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update specification');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductSpecification,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-specifications', selectedProductId]);
      toast.success('Specification deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedSpecification(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete specification');
    }
  });

  // Handlers
  const handleProductSelect = (product) => {
    setSelectedProductId(product.id);
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setSelectedIndex(-1);
    setSearchTerm('');
    setSelectedGroup('');
  };

  const handleProductSearchChange = (e) => {
    setProductSearch(e.target.value);
    setShowProductDropdown(true);
    setSelectedIndex(-1);
  };

  const handleClearSelection = () => {
    setSelectedProductId('');
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

  const handleCreate = () => {
    if (!selectedProductId) {
      toast.error('Please select a product first');
      return;
    }
    setSelectedSpecification(null);
    setIsModalOpen(true);
  };

  const handleEdit = (specification) => {
    setSelectedSpecification(specification);
    setIsModalOpen(true);
  };

  const handleDelete = (specification) => {
    setSelectedSpecification(specification);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (data) => {
    if (selectedSpecification) {
      updateMutation.mutate({ id: selectedSpecification.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const confirmDelete = () => {
    if (selectedSpecification) {
      deleteMutation.mutate(selectedSpecification.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Specifications</h1>
          <p className="text-gray-600 mt-1">Manage detailed specifications for your products</p>
        </div>
        <Button onClick={handleCreate} disabled={!selectedProductId}>
          ➕ Add Specification
        </Button>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Product</h2>
        <div className="product-dropdown max-w-md">
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={handleProductSearchChange}
              onFocus={() => setShowProductDropdown(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              placeholder="Search products..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm pr-20"
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

          {/* Product Dropdown */}
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

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="mt-4 p-4 bg-gray-50 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-lg">{selectedProduct.name}</div>
                <div className="text-gray-600">
                  {selectedProduct.model && <span>Model: {selectedProduct.model}</span>}
                  {selectedProduct.model && selectedProduct.sku && <span> • </span>}
                  {selectedProduct.sku && <span>SKU: {selectedProduct.sku}</span>}
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${
                selectedProduct.type === 'videography' ? 'bg-blue-100 text-blue-800' :
                selectedProduct.type === 'photography' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {selectedProduct.type === 'videography' ? '🎥 Video' :
                 selectedProduct.type === 'photography' ? '📸 Photo' : '🎬 Both'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Specifications List */}
      {selectedProductId && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
              <div className="text-sm text-gray-500">
                {filteredSpecifications.length} of {specifications.length} specifications
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search specifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                />
              </div>
              <div className="w-48">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                >
                  <option value="">All Groups</option>
                  {groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading specifications...
              </div>
            ) : filteredSpecifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {specifications.length === 0 ? (
                  <div>
                    <p className="text-lg mb-2">No specifications found</p>
                    <p className="text-sm">Add the first specification for this product</p>
                  </div>
                ) : (
                  <p>No specifications match your search criteria</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSpecifications.map((spec) => (
                    <tr key={spec.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{spec.spec_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{spec.spec_value}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {spec.spec_group ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {spec.spec_group}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {spec.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleEdit(spec)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => handleDelete(spec)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSpecification(null);
        }}
        title={selectedSpecification ? 'Edit Specification' : 'Add Specification'}
      >
        <ProductSpecificationForm
          onSubmit={handleSubmit}
          initialData={selectedSpecification}
          selectedProductId={selectedProductId}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSpecification(null);
        }}
        title="Delete Specification"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the specification "{selectedSpecification?.spec_name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedSpecification(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
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