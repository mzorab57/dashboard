import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getTags, createTag, updateTag, deleteTag } from '@/lib/tagApi';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TagForm from '@/components/tags/TagForm';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function TagsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  const { data: tagsData, isLoading, error } = useQuery({
    queryKey: ['tags', currentPage, debouncedSearch],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (debouncedSearch) params.q = debouncedSearch;
      
      return await getTags(params);
    }
  });

  const tags = tagsData?.data || [];

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
    mutationFn: async (tagData) => {
      return await createTag(tagData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully!');
      setIsModalOpen(false);
      setEditingTag(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create tag');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, tagData }) => {
      return await updateTag(id, tagData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag updated successfully!');
      setIsModalOpen(false);
      setEditingTag(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update tag');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete tag');
    },
  });

  const handleDelete = (tag) => {
    setDeletingTag(tag);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTag) {
      deleteMutation.mutate(deletingTag.id);
      setIsDeleteModalOpen(false);
      setDeletingTag(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingTag(null);
  };

  const handleSubmit = (tagData) => {
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, tagData });
    } else {
      createMutation.mutate(tagData);
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Tags</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder="Search tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent"
              />
            </div>
            <Button
              onClick={openCreateModal}
              className=" text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Tag
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
            Failed to load tags. Please try again.
          </div>
        ) : tags.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No tags found. {search && 'Try a different search term.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-2 pr-2">ID</th>
                  <th className="pb-2 px-2">Name</th>
                  <th className="pb-2 px-2">Slug</th>
                  <th className="pb-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, index) => (
                  <tr key={tag.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-2 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-2">
                        <span className="font-medium">{tag.name}</span>
                    </td>
                    <td className="py-3 px-2 text-sm">{tag.slug}</td>
                    
                   
                    <td className="py-3 pl-2">
                      <div className="flex gap-1">
                        <Button
                          onClick={() => openEditModal(tag)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(tag)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
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
        {tagsData?.pagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, tagsData.pagination.total)} of {tagsData.pagination.total} results
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
                onClick={() => setCurrentPage(Math.min(tagsData.pagination.pages, currentPage + 1))}
                disabled={currentPage === tagsData.pagination.pages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTag ? 'Edit Tag' : 'Create Tag'}
        >
          <TagForm
            tag={editingTag}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={cancelDelete}
          title="Delete Tag"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the tag "{deletingTag?.name}"? This action cannot be undone.
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
    </div>
  );
}