import { useState, useEffect } from 'react';
import  Button  from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getDiscounts, deleteDiscount, searchDiscounts, calculateProductDiscounts } from '@/lib/discountApi';
import DiscountForm from '@/components/discounts/DiscountForm';

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorProductId, setCalculatorProductId] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculatingDiscount, setCalculatingDiscount] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadDiscounts();
  }, [currentPage, searchTerm, filterType, filterStatus]);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm) {
        response = await searchDiscounts({
          query: searchTerm,
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          page: currentPage,
          limit: itemsPerPage
        });
      } else {
        response = await getDiscounts({
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          page: currentPage,
          limit: itemsPerPage
        });
      }
      
      setDiscounts(response.data || []);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error loading discounts:', error);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedDiscount(null);
    setShowForm(true);
  };

  const handleEdit = (discount) => {
    setSelectedDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id);
      loadDiscounts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const handleFormSuccess = () => {
    loadDiscounts();
    setShowForm(false);
    setSelectedDiscount(null);
  };

  const handleCalculateDiscount = async () => {
    if (!calculatorProductId) return;
    
    setCalculatingDiscount(true);
    setCalculationResult(null);
    
    try {
      const result = await calculateProductDiscounts(calculatorProductId);
      if (result.success) {
        setCalculationResult(result.data);
      } else {
        console.error('Failed to calculate discount:', result.error);
      }
    } catch (error) {
      console.error('Error calculating discount:', error);
    } finally {
      setCalculatingDiscount(false);
    }
  };

  const getStatusBadge = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);

    if (!discount.is_active) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (now < startDate) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
    }
    
    if (now > endDate) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ku-IQ');
  };

  const formatValue = (type, value) => {
    return type === 'percentage' ? `${value}%` : `$${value}`;
  };

  const getTargetTypeName = (type) => {
    switch (type) {
      case 'product': return 'Product';
      case 'category': return 'Category';
      case 'subcategory': return 'Subcategory';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCalculator(!showCalculator)} variant="secondary">
            🧮 Calculate Discount
          </Button>
          <Button onClick={handleCreate} variant="primary">
            + Create Discount
          </Button>
        </div>
      </div>

      {/* Discount Calculator */}
      {showCalculator && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Discount Calculator</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Product ID
              </label>
              <input
                type="number"
                value={calculatorProductId}
                onChange={(e) => setCalculatorProductId(e.target.value)}
                placeholder="Enter product ID to calculate discount"
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleCalculateDiscount}
              disabled={!calculatorProductId || calculatingDiscount}
              variant="primary"
            >
              {calculatingDiscount ? 'Calculating...' : 'Calculate'}
            </Button>
          </div>
          
          {calculationResult && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">
                {calculationResult.product.name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Original Price:</span>
                  <div className="font-medium">${calculationResult.pricing.original_price}</div>
                </div>
                <div>
                  <span className="text-gray-600">Final Price:</span>
                  <div className="font-medium text-green-600">${calculationResult.pricing.final_price}</div>
                </div>
                <div>
                  <span className="text-gray-600">Discount:</span>
                  <div className="font-medium text-red-600">-{calculationResult.pricing.discount_percentage}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Savings:</span>
                  <div className="font-medium">${calculationResult.pricing.discount_amount}</div>
                </div>
              </div>
              {calculationResult.discount && (
                <div className="mt-2 text-sm text-blue-600">
                  Applied: {calculationResult.discount.name} ({calculationResult.discount.target_type} level)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
                setCurrentPage(1);
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {discounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No discounts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                        {discount.description && (
                          <div className="text-sm text-gray-500">{discount.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatValue(discount.type, discount.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTargetTypeName(discount.target_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{formatDate(discount.start_date)}</div>
                        <div className="text-gray-500">to {formatDate(discount.end_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(discount)}
                      >
                       ✏️
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteConfirm(discount.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Form Modal */}
      <DiscountForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDiscount(null);
        }}
        discount={selectedDiscount}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this discount? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DiscountList;