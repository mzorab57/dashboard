import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/categoryApi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import CategoryForm from '@/components/categories/CategoryForm';

export default function CategoriesList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories', page, debouncedSearch.trim()],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (debouncedSearch && debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
      }
      return await getCategories(params);
    },
    enabled: true,
    refetchOnWindowFocus: false
  });

  const categories = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return await createCategory(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setIsModalOpen(false);
      toast.success('Category created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return await updateCategory(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setIsModalOpen(false);
      setSelectedCategory(null);
      toast.success('Category updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  });

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

   const handleSubmit = (formData) => {
     if (!formData) {
       setIsModalOpen(false);
       setSelectedCategory(null);
       return;
     }

     if (selectedCategory) {
       updateMutation.mutate({ id: selectedCategory.id, formData });
     } else {
       createMutation.mutate(formData);
     }
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
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex gap-2">
            <div className="flex">
              <input 
                type="text" 
                value={search}
                onChange={handleSearchInputChange}
                placeholder="Search categories..." 
                className="rounded-md border px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black"
             >
               Add Category
             </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
              <span className="text-gray-500">Loading categories...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-2">❌ Error loading categories</div>
              <div className="text-sm text-gray-500 mb-4">{error.message}</div>
              <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No categories found. {search && 'Try a different search term.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-2 px-2">id</th>
                  <th className="pb-2 px-2">Image</th>
                  <th className="pb-2 px-2">Name</th>
                  <th className="pb-2 px-2">Slug</th>
                  <th className="pb-2 px-2">Status</th>
                  <th className="pb-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-2 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-2">
                      {category.image_url ? (
                        <img 
                          src={category.image_url.startsWith('http') ? category.image_url : `http://localhost/api${category.image_url}`} 
                          alt={category.name}
                          className="h-10 w-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center image-placeholder ${category.image_url ? 'hidden' : ''}`}>
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{category.name}</div>
                      {category.parent_name && (
                        <div className="text-xs text-gray-500">Parent: {category.parent_name}</div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsModalOpen(true);
                          }}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(category)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          🗑️
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
        {!isLoading && categories.length > 0 && (
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

      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
           category={selectedCategory}
           onSubmit={handleSubmit}
           onCancel={() => {
             setIsModalOpen(false);
             setSelectedCategory(null);
           }}
           isLoading={createMutation.isPending || updateMutation.isPending}
         />
      </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          title="Delete Category"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
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