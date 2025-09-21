import { useState, useEffect } from 'react';
import  Button  from '@/components/ui/Button';
import  Modal  from '@/components/ui/Modal';
import { createDiscount, updateDiscount, getProducts, getCategories, getSubcategories } from '@/lib/discountApi';

const DiscountForm = ({ isOpen, onClose, discount = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage', // percentage or fixed
    value: '',
    target_type: 'product', // product, category, subcategory
    target_id: '',
    start_date: '',
    end_date: '',
    min_quantity: 1,
    max_usage: '',
    is_active: true
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadTargetOptions();
      if (discount) {
        setFormData({
          name: discount.name || '',
          description: discount.description || '',
          type: discount.discount_type || 'percentage',
          value: discount.discount_value || '',
          target_type: discount.target_type || 'product',
          target_id: discount.target_id || '',
          start_date: discount.start_date ? discount.start_date.split('T')[0] : '',
          end_date: discount.end_date ? discount.end_date.split('T')[0] : '',
          min_quantity: discount.min_order_amount || 1,
          max_usage: discount.max_uses || '',
          is_active: discount.is_active !== undefined ? discount.is_active : true
        });
      } else {
        setFormData({
          name: '',
          description: '',
          type: 'percentage',
          value: '',
          target_type: 'product',
          target_id: '',
          start_date: '',
          end_date: '',
          min_quantity: 1,
          max_usage: '',
          is_active: true
        });
      }
      setErrors({});
    } else {
      // Reset form data and errors when modal closes
      setFormData({
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        target_type: 'product',
        target_id: '',
        start_date: '',
        end_date: '',
        min_quantity: 1,
        max_usage: '',
        is_active: true
      });
      setErrors({});
    }
  }, [isOpen, discount]);

  const loadTargetOptions = async () => {
    try {
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getSubcategories()
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
    } catch (error) {
      console.error('Error loading target options:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Discount name is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Discount value is required and must be greater than zero';
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Discount percentage cannot be greater than 100%';
    }

    if (formData.type === 'fixed_amount' && formData.value < 0) {
      newErrors.value = 'Fixed amount cannot be negative';
    }

    if (!formData.target_id) {
      newErrors.target_id = 'Target selection is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (formData.min_quantity < 1) {
      newErrors.min_quantity = 'Minimum quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        discount_type: formData.type,
        discount_value: parseFloat(formData.value),
        target_type: formData.target_type,
        target_id: parseInt(formData.target_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        priority: 0,
        max_uses: formData.max_usage ? parseInt(formData.max_usage) : null,
        min_order_amount: formData.min_quantity || null
      };

      if (discount) {
        await updateDiscount(discount.id, submitData);
      } else {
        await createDiscount(submitData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving discount:', error);
      setErrors({ submit: 'An error occurred while saving the discount' });
    } finally {
      setLoading(false);
    }
  };

  const getTargetOptions = () => {
    switch (formData.target_type) {
      case 'product':
        return products;
      case 'category':
        return categories;
      case 'subcategory':
        return subcategories;
      default:
        return [];
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={discount ? 'Edit Discount' : 'Create New Discount'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter discount name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter discount description"
          />
        </div>

        {/* Type and Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value *
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              min="0"
              step={formData.type === 'percentage' ? '0.01' : '0.01'}
              max={formData.type === 'percentage' ? '100' : undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.value ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.type === 'percentage' ? 'Percentage (0-100)' : 'Amount'}
            />
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
          </div>
        </div>

        {/* Target Type and Target */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Type *
            </label>
            <select
              name="target_type"
              value={formData.target_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="subcategory">Subcategory</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Target *
            </label>
            <select
              name="target_id"
              value={formData.target_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.target_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select...</option>
              {getTargetOptions().map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.target_id && <p className="text-red-500 text-sm mt-1">{errors.target_id}</p>}
          </div>
        </div>

        {/* Start and End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
          </div>
        </div>

        {/* Min Quantity and Max Usage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity
            </label>
            <input
              type="number"
              name="min_quantity"
              value={formData.min_quantity}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.min_quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.min_quantity && <p className="text-red-500 text-sm mt-1">{errors.min_quantity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Usage
            </label>
            <input
              type="number"
              name="max_usage"
              value={formData.max_usage}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Unlimited"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-red-500 text-sm">{errors.submit}</div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (discount ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DiscountForm;