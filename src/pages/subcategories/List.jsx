import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getCategories } from '@/lib/categoryApi';
import { getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '@/lib/subcategoryApi';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SubcategoryForm from '@/components/subcategories/SubcategoryForm';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function SubcategoriesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSubcategory, setDeletingSubcategory] = useState(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      return await getCategories({ limit: 100 });
    }
  });

  const categories = categoriesData?.data || [];

  const { data: subcategoriesData, isLoading, error } = useQuery({
    queryKey: ['subcategories', currentPage, debouncedSearch, selectedCategory, selectedType, selectedStatus],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (debouncedSearch) params.q = debouncedSearch;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedType) params.type = selectedType;
      if (selectedStatus) params.is_active = selectedStatus;
      
      return await getSubcategories(params);
    }
  });

  const subcategories = subcategoriesData?.data || [];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return await createSubcategory(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast.success('Subcategory created successfully!');
      setIsModalOpen(false);
      setEditingSubcategory(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create subcategory');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return await updateSubcategory(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast.success('Subcategory updated successfully!');
      setIsModalOpen(false);
      setEditingSubcategory(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update subcategory');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteSubcategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast.success('Subcategory deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
    },
  });

  const handleDelete = (subcategory) => {
    setDeletingSubcategory(subcategory);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSubcategory) {
      deleteMutation.mutate(deletingSubcategory.id);
      setIsDeleteModalOpen(false);
      setDeletingSubcategory(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingSubcategory(null);
  };

  const handleSubmit = (formData) => {
    if (editingSubcategory) {
      updateMutation.mutate({ id: editingSubcategory.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (subcategory) => {
    setEditingSubcategory(subcategory);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubcategory(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Subcategories</h2>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Subcategory
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            className="flex-1 min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          />
          
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="both">Both</option>
            <option value="photography">Photography</option>
            <option value="videography">Videography</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-md bg-gray-200" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-3 text-red-700">
            Failed to load subcategories. Please try again.
          </div>
        ) : subcategories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No subcategories found. {debouncedSearch && 'Try a different search term.'}
            {selectedCategory && ' Try a different category filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-2 pr-2">ID</th>
                  <th className="pb-2 px-2">Image</th>
                  <th className="pb-2 px-2">Name</th>
                  <th className="pb-2 px-2">Parent Category</th>
                  <th className="pb-2 px-2">Type</th>
                  <th className="pb-2 px-2">Slug</th>
                  <th className="pb-2 px-2">Status</th>
                  <th className="pb-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((subcategory, index) => (
                  <tr key={subcategory.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-2 text-sm text-gray-600">{index + 1}</td>
                     <td className="py-3 px-2">
                      {subcategory.image_url ? (
                        <img 
                          src={subcategory.image_url.startsWith('http') ? subcategory.image_url : `http://localhost/api${subcategory.image_url}`} 
                          alt={subcategory.name}
                          className="size-10 rounded object-cover bg-gray-100"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="size-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs" style={{display: subcategory.image_url ? 'none' : 'flex'}}>
                        📷
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium">{subcategory.name}</td>
                    <td className="py-3 px-2 text-sm">{subcategory.category_name || 'N/A'}</td>
                      <td className="py-3 px-2 text-sm">
                      <span className={`inline-block rounded px-2 py-1 text-xs ${
                        subcategory.type === 'videography' ? 'bg-blue-100 text-blue-800' :
                        subcategory.type === 'photography' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {subcategory.type === 'videography' ? '🎥 Video' :
                         subcategory.type === 'photography' ? '📸 Photo' : '🎬 Both'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm">{subcategory.slug}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${subcategory.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {subcategory.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openEditModal(subcategory)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(subcategory)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {subcategoriesData?.pagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, subcategoriesData.pagination.total)} of {subcategoriesData.pagination.total} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(subcategoriesData.pagination.total / itemsPerPage)}
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
        title={editingSubcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
      >
        <SubcategoryForm
          subcategory={editingSubcategory}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="Delete Subcategory"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>"{deletingSubcategory?.name}"</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelDelete}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
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