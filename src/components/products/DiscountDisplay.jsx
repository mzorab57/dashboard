import { useState, useEffect } from 'react';
import { getProductDiscounts } from '@/lib/discountApi';

export default function DiscountDisplay({ productId, originalPrice }) {
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Ensure originalPrice is a valid number
  const validOriginalPrice = parseFloat(originalPrice) || 0;

  useEffect(() => {
    const fetchDiscount = async () => {
      if (!productId || validOriginalPrice <= 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const result = await getProductDiscounts(productId);
        
        if (result && result.data && result.data.length > 0) {
          // Use the first discount found
          const discountData = result.data[0];
          let finalPrice = validOriginalPrice;
          
          // Handle different field names from API
          const discountType = discountData.discount_type || discountData.type;
          const discountValue = parseFloat(discountData.discount_value || discountData.value);
          
          if (discountType === 'percentage') {
            finalPrice = validOriginalPrice * (1 - discountValue / 100);
          } else if (discountType === 'fixed_amount' || discountType === 'fixed') {
            finalPrice = Math.max(0, validOriginalPrice - discountValue);
          }
          
          setDiscount({
            has_discount: true,
            final_price: finalPrice,
            discount: {
              ...discountData,
              type: discountType,
              value: discountValue,
              name: discountData.name,
              target_type: discountData.target_type
            }
          });
        } else {
          setDiscount(null);
        }
      } catch (err) {
        console.error('Error fetching discount:', err);
        setError(true);
        setDiscount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [productId, validOriginalPrice]);

  if (loading) {
    return (
      <div className="text-xs text-gray-400">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-400">
        Error
      </div>
    );
  }

  if (!discount || !discount.has_discount) {
    return (
      <div className="text-xs text-gray-400">
        No discount
      </div>
    );
  }

  const savings = validOriginalPrice - discount.final_price;
  const discountPercentage = Math.round((savings / validOriginalPrice) * 100);

  return (
    <div className="text-xs">
      <div className="text-green-600 font-medium">
        -{discountPercentage}% off
      </div>
      <div className="text-gray-600">
        Save ${savings.toFixed(2)}
      </div>
      {discount.discount && (
        <div className="text-blue-600" title={discount.discount.name}>
          {discount.discount.target_type} level
        </div>
      )}
    </div>
  );
}