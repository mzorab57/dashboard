import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  getProductImagesByProductId, 
  createProductImage, 
  updateProductImage, 
  deleteProductImage,
  setPrimaryImage 
} from '@/lib/productImageApi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ProductImageForm from '@/components/product-images/ProductImageForm';
import { toast } from 'react-hot-toast';

export default function ProductImagesList() {
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const imagesRef = useRef(null);

  // 1. Fetch ALL Products (Server-side once, then filter locally)
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products-all-for-selection'],
    queryFn: async () => {
      const perPage = 100;
      const maxPages = 50; // بڕی ٥٠٠٠ بەرهەم دەهێنێت ئەگەر هەبێت
      
      const collect = async (endpoint, params) => {
        let page = 1;
        let out = [];
        for (;;) {
          const res = await api.get(endpoint, { params: { ...params, page, limit: perPage } });
          const d = res.data;
          const arr = Array.isArray(d) ? d : (d?.data || []);
          out = out.concat(arr);
          if (arr.length < perPage || page >= maxPages) break;
          page += 1;
        }
        return out;
      };

      // لێرە هەموو بەرهەمەکان دەهێنین یەکجار
      const arr = await collect('/products/get.php', { is_active: 'all' });
      return arr;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // ٣٠ خولەک داتاکە بە تازە (Fresh) دادەنێت
  });

  const allProducts = Array.isArray(productsData)
    ? productsData
    : (productsData?.data || []);

  // 2. Client-side Filter: فلتەرکردنی بەرهەمەکان بەپێی نوسینی ناو درۆپداونەکە
  const filteredProducts =  (Array.isArray(allProducts) ? allProducts : []).filter(product => {
    if (!productSearch || productId === product.id) return false;
    const term = productSearch.toLowerCase().trim();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.type?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.model?.toLowerCase().includes(term)
    );
  }).slice(0, 100); // تەنها ١٠٠ ئەنجامی یەکەم نیشان بدە بۆ باشی Performance

  // 3. Fetch Selected Product Images
  const { data: imagesData, isLoading: isImagesLoading, error } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => getProductImagesByProductId(productId),
    enabled: !!productId,
    refetchOnWindowFocus: false
  });

  const images = imagesData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images', productId]);
      toast.success('Image added successfully');
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateProductImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images', productId]);
      toast.success('Image updated');
      setIsModalOpen(false);
      setSelectedImage(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images', productId]);
      toast.success('Image deleted');
      setIsDeleteModalOpen(false);
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: setPrimaryImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['product-images', productId]);
      toast.success('Primary image set');
    }
  });

  // Handlers
  const handleProductSelect = (product) => {
    setProductId(product.id);
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setSelectedIndex(-1);
    setTimeout(() => {
      imagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (!showProductDropdown || filteredProducts.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(p => (p < filteredProducts.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(p => (p > 0 ? p - 1 : filteredProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) handleProductSelect(filteredProducts[selectedIndex]);
      else handleProductSelect(filteredProducts[0]);
    } else if (e.key === 'Escape') {
      setShowProductDropdown(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (!e.target.closest('.product-dropdown')) setShowProductDropdown(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Product Gallery</h1>
          <p className="text-gray-500 text-sm">Loaded {allProducts.length} products for quick search</p>
        </div>
        <Button 
          disabled={!productId}
          onClick={() => { setSelectedImage(null); setIsModalOpen(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 shadow-md transition-all"
        >
          ➕ Add New Image
        </Button>
      </div>

      {/* Search & Selection Section */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-8">
        <div className="relative product-dropdown max-w-2xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onFocus={() => setShowProductDropdown(true)}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
                if(!e.target.value) setProductId('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={isProductsLoading ? "Syncing products..." : "Type product name, SKU or model..."}
              className="w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-3 text-gray-400">
              {isProductsLoading ? <div className="animate-spin h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full" /> : "🔍"}
            </div>
          </div>

          {showProductDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-96 overflow-y-auto ring-1 ring-black ring-opacity-5">
              {filteredProducts.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => handleProductSelect(p)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center ${
                    i === selectedIndex ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-widest">
                      {p.model || 'No Model'} • SKU: {p.sku || 'N/A'}
                    </div>
                  </div>
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-mono text-gray-400">ID:{p.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {productId && (
          <div className="mt-4 p-3 bg-cyan-50 border border-cyan-100 rounded-lg flex items-center gap-3">
             <div className="bg-cyan-500 text-white p-1.5 rounded-md text-xs font-bold">ACTIVE</div>
             <span className="text-sm font-medium text-cyan-900">Editing images for: <strong>{productSearch}</strong></span>
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div ref={imagesRef} className="min-h-[400px]">
        {!productId ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            <span className="text-5xl mb-4">🖼️</span>
            <p className="font-medium text-lg">Search and select a product to manage its gallery</p>
          </div>
        ) : isImagesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(n => <div key={n} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <img 
                  src={img.image_full_url || img.image_url} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt=""
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                />
                
                {img.is_primary == 1 && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm z-10">PRIMARY</div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => { setSelectedImage(img); setIsModalOpen(true); }} className="p-2 bg-white rounded-full hover:bg-cyan-500 hover:text-white transition-colors">✏️</button>
                  <button onClick={() => { setSelectedImage(img); setIsDeleteModalOpen(true); }} className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                  {img.is_primary != 1 && (
                    <button onClick={() => setPrimaryMutation.mutate(img.id)} className="p-2 bg-white rounded-full hover:bg-yellow-500 hover:text-white transition-colors">⭐</button>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                   Order: {img.display_order}
                </div>
              </div>
            ))}
            
            {/* <button 
              onClick={() => setIsModalOpen(true)}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-cyan-500 hover:text-cyan-500 hover:bg-cyan-50 transition-all"
            >
              <span className="text-3xl">+</span>
              <span className="text-xs font-bold mt-1">Add Image</span>
            </button> */}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedImage ? 'Update Image' : 'Add Image'}>
        <ProductImageForm
          image={selectedImage}
          productId={productId}
          onSubmit={(d) => selectedImage ? updateMutation.mutate({...d, id: selectedImage.id}) : createMutation.mutate(d)}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="p-4">
          <p className="text-gray-600 mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(selectedImage.id)} disabled={deleteMutation.isPending}>
               {deleteMutation.isPending ? 'Deleting...' : 'Delete Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
