import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { getBrands, searchBrands } from '@/lib/brandApi';
import Button from '../ui/Button';

export default function ProductForm({ onSubmit, initialData, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    model: initialData?.model || '',
    slug: initialData?.slug || '',
    sku: initialData?.sku || '',
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
    price: initialData?.price || '',
    discount_price: initialData?.discount_price || '',
    type: initialData?.type || 'both',
    brand: initialData?.brand || '',
    subcategory_id: initialData?.subcategory_id || '',
    is_featured: initialData?.is_featured ?? false,
    is_active: initialData?.is_active ?? true,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    image_url: initialData?.image_url || '',
  });
  
  // Auto-generate meta title and description based on product name
  const generateMetaFields = (name) => {
    if (!name.trim()) return { meta_title: '', meta_description: '' };
    
    const meta_title = `${name} - High Quality ${formData.type === 'photography' ? 'Photography' : formData.type === 'videography' ? 'Videography' : 'Photography & Videography'} Equipment`;
    const meta_description = `Discover ${name} - Premium ${formData.type} equipment with excellent quality and competitive pricing. Perfect for professional and amateur photographers.`;
    
    return { meta_title, meta_description };
  };
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState('');

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData?.name || '',
        model: initialData?.model || '',
        slug: initialData?.slug || '',
        sku: initialData?.sku || '',
        description: initialData?.description || '',
        short_description: initialData?.short_description || '',
        price: initialData?.price || '',
        discount_price: initialData?.discount_price || '',
        type: initialData?.type || 'both',
        brand: initialData?.brand || '',
        subcategory_id: initialData?.subcategory_id || '',
        is_featured: initialData?.is_featured ?? false,
        is_active: initialData?.is_active ?? true,
        meta_title: initialData?.meta_title || '',
        meta_description: initialData?.meta_description || '',
        image_url: initialData?.image_url || '',
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        model: '',
        slug: '',
        sku: '',
        description: '',
        short_description: '',
        price: '',
        discount_price: '',
        type: 'both',
        brand: '',
        subcategory_id: '',
        is_featured: false,
        is_active: true,
        meta_title: '',
        meta_description: '',
        image_url: '',
      });
      setImageFile(null);
       setSelectedCategory('');
     }
   }, [initialData]);
  
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories/get.php', { params: { limit: 100 } });
      return response.data;
    }
  });
  
  // Fetch subcategories based on selected category
  const { data: subcategoriesData } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return { data: [] };
      const response = await api.get('/subcategories/get.php', { 
        params: { category_id: selectedCategory, limit: 100 } 
      });
      return response.data;
    },
    enabled: !!selectedCategory
  });
  
  // Fetch brands for dropdown
  const { data: brandsData } = useQuery({
    queryKey: ['brands', brandSearch],
    queryFn: async () => {
      if (brandSearch.trim() ) {
        return await searchBrands(brandSearch);
      }
      return await getBrands({ limit: 50 });
    },
    enabled: showBrandDropdown || brandSearch.length > 0
  });
  
  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];
  const brands = brandsData?.data?.filter(brand => brand.is_active === 1) || [];
  
  // Set initial category if editing
  useEffect(() => {
    if (initialData?.subcategory_id && categories.length > 0) {
      const subcategory = subcategories.find(sub => sub.id == initialData.subcategory_id);
      if (subcategory) {
        setSelectedCategory(subcategory.category_id);
      }
    }
  }, [initialData, categories, subcategories]);
  
  // Set initial brand search if editing
  useEffect(() => {
    if (initialData?.brand) {
      setBrandSearch(initialData.brand);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Auto-generate meta fields when name changes
      if (name === 'name' && newValue.trim()) {
        const metaFields = generateMetaFields(newValue);
        return {
          ...updated,
          ...metaFields
        };
      }
      
      return updated;
    });
  };
  
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      subcategory_id: '' // Reset subcategory when category changes
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };
  
  const handleBrandSearch = (e) => {
    const value = e.target.value;
    setBrandSearch(value);
    setFormData(prev => ({ ...prev, brand: value }));
    setShowBrandDropdown(true);
  };
  
  const handleBrandSelect = (brand) => {
    setBrandSearch(brand.name);
    setSelectedBrandId(brand.id);
    setFormData(prev => ({ ...prev, brand: brand.name }));
    setShowBrandDropdown(false);
  };
  
  const handleBrandFocus = () => {
    setShowBrandDropdown(true);
  };
  
  const handleBrandBlur = () => {
    // Delay hiding dropdown to allow click on options
    setTimeout(() => setShowBrandDropdown(false), 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const submitData = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });
    
    // Add image file if selected
    if (imageFile) {
      submitData.append('image', imageFile);
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name && Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <input
          type="text"
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
      </div>
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory *
          </label>
          <select
            id="subcategory_id"
            name="subcategory_id"
            value={formData.subcategory_id}
            onChange={handleChange}
            required
            disabled={!selectedCategory}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        >
          <option value="videography">Videography</option>
          <option value="photography">Photography</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Brand */}
      <div className="relative">
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
          Brand
        </label>
        <input
          autoComplete='off'
          type="text"
          id="brand"
          name="brand"
          value={brandSearch}
          onChange={handleBrandSearch}
          onFocus={handleBrandFocus}
          onBlur={handleBrandBlur}
          placeholder="Search or type brand name..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
        
        {/* Brand Dropdown */}
        {showBrandDropdown && brands.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {brands
              .filter(brand => 
                brand.name.toLowerCase().includes(brandSearch.toLowerCase())
              )
              .slice(0, 10)
              .map(brand => (
                <div
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>{brand.name}</span>
                  {brand.is_active ? (
                    <span className="text-xs text-green-600">Active</span>
                  ) : (
                    <span className="text-xs text-gray-400">Inactive</span>
                  )}
                </div>
              ))
            }
            {brandSearch && !brands.some(brand => 
              brand.name.toLowerCase() === brandSearch.toLowerCase()
            ) && (
              <div className="px-3 py-2 text-sm text-gray-500 border-t">
                Press Enter to use "{brandSearch}" as new brand
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price & Discount Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-1">
            Discount Price
          </label>
          <input
            type="number"
            id="discount_price"
            name="discount_price"
            value={formData.discount_price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          />
        </div>
      </div>

      {/* SKU & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-xs text-gray-500">(Optional - Auto-generated)</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
            placeholder="Auto-generated from product name"
          />
        </div>
      </div>

      {/* Descriptions  */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          id="short_description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
      </div>
      </div>

      {/* Image Upload & URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-md border px-4 py-1 border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, WEBP, GIF</p>
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
      </div>
      </div>

      {/* Meta Fields */}
      {/* <div>
        <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
          Meta Title <span className="text-xs text-gray-500">(Optional - Auto-generated)</span>
        </label>
        <input
          type="text"
          id="meta_title"
          name="meta_title"
          value={formData.meta_title}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="Auto-generated from product name"
        />
      </div>

      <div>
        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
          Meta Description <span className="text-xs text-gray-500">(Optional - Auto-generated)</span>
        </label>
        <textarea
          id="meta_description"
          name="meta_description"
          value={formData.meta_description}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="Auto-generated from product name and type"
        />
      </div> */}

      {/* Checkboxes */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
            Featured
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => onSubmit(null)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
