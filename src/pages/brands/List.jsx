import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/lib/brandApi';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import BrandForm from '@/components/brands/BrandForm';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BrandsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ['brands', currentPage, selectedStatus],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (selectedStatus) params.is_active = selectedStatus;
      
      return await getBrands(params);
    }
  });

  const allBrands = brandsData?.data || [];
  
  // Client-side filtering for brand name or slug
  const [brandSearch, setBrandSearch] = useState('');
  
  const filteredBrands = allBrands.filter(brand => 
    brand.name.toLowerCase().includes(brandSearch.toLowerCase()) || 
    (brand.slug && brand.slug.toLowerCase().includes(brandSearch.toLowerCase())) 
  );
  
  const brands = filteredBrands;

  const handleSearchInputChange = (e) => {
    setBrandSearch(e.target.value);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return await createBrand(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand created successfully!');
      setIsModalOpen(false);
      setEditingBrand(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create brand');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return await updateBrand(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand updated successfully!');
      setIsModalOpen(false);
      setEditingBrand(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update brand');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteBrand(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete brand');
    },
  });

  const handleDelete = (brand) => {
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingBrand) {
      deleteMutation.mutate(deletingBrand.id);
      setIsDeleteModalOpen(false);
      setDeletingBrand(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingBrand(null);
  };

  const handleSubmit = (formData) => {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Brands</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={brandSearch}
              onChange={handleSearchInputChange}
              placeholder="Filter by name or slug..." 
              className="rounded-md border px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 min-w-[250px]"
            />
           
            <Button
              onClick={openCreateModal}
              className="flex whitespace-nowrap items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Brand
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
            Failed to load brands. Please try again.
          </div>
        ) : brands.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No brands found. {search && 'Try a different search term.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-2 pr-2">ID</th>
                  <th className="pb-2 px-2">Logo</th>
                  <th className="pb-2 px-2">Name</th>
                  <th className="pb-2 px-2">Slug</th>
                  {/* <th className="pb-2 px-2">Products</th> */}
                  <th className="pb-2 px-2">Description</th>
                  <th className="pb-2 px-2">Status</th>
                  <th className="pb-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand, index) => (
                  <tr key={brand.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-2 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-2">
                      {brand.logo_url ? (
                        <img 
                            src={brand.logo_url.startsWith('http') ? brand.logo_url : `http://localhost/api${brand.logo_url}`} 
                          alt={`${brand.name} logo`} 
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                          No logo
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 font-medium">{brand.name}</td>
                    <td className="py-3 px-2 text-sm">{brand.slug}</td>
                    {/* <td className="py-3 px-2 text-sm">{brand.product_count || 0}</td> */}
                    <td className="py-3 px-2 text-sm">{brand.description}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${brand.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex gap-1">
                        <Button
                          onClick={() => openEditModal(brand)}
                          variant="secondary"
                          size="sm"
                          
                        >
                          ✏️
                        </Button>
                        <Button
                          onClick={() => handleDelete(brand)}
                          variant="danger"
                          size="sm"
                          
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
        {brandsData?.pagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, brandsData.pagination.total)} of {brandsData.pagination.total} results
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(brandsData.pagination.total_pages, currentPage + 1))}
                disabled={currentPage === brandsData.pagination.total_pages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBrand ? 'Edit Brand' : 'Create Brand'}
      >
        <BrandForm
          brand={editingBrand}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="Delete Brand"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the brand "{deletingBrand?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={cancelDelete}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
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