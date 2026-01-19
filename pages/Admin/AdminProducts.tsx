
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types';
import { Plus, Edit, Trash2, Package, Upload, X, Loader2 } from 'lucide-react';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    image_url: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false });
    const { data: cats } = await supabase.from('categories').select('*');
    if (prods) setProducts(prods as any);
    if (cats) {
      setCategories(cats);
      if (cats.length > 0 && !formData.category_id) setFormData(prev => ({ ...prev, category_id: cats[0].id }));
    }
    setLoading(false);
  };

  const uploadProductImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
      } else if (!formData.id && !finalImageUrl) {
         // Require image for new products if not already provided
         alert('Please upload a product image');
         setUploading(false);
         return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: formData.category_id,
        image_url: finalImageUrl
      };

      if (formData.id) {
        // Update
        const { error } = await supabase.from('products').update(productData).eq('id', formData.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '', price: 0, stock: 0, category_id: categories[0]?.id || '', image_url: '' });
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (prod: Product) => {
    setFormData({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      stock: prod.stock,
      category_id: prod.category_id,
      image_url: prod.image_url || ''
    });
    setImagePreview(prod.image_url || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-gradient">Inventory</h1>
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mt-2">Premium Gadget Management</p>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
        >
          <Plus size={20} /> Add New Gadget
        </button>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 glass rounded-[2.5rem] animate-pulse"></div>)}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod) => (
            <div key={prod.id} className="glass p-8 rounded-[2.5rem] flex flex-col border border-white/5 hover:border-white/20 transition-all group">
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 glass">
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Package size={48} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleEdit(prod)} className="p-2 glass text-blue-400 hover:bg-white/10 rounded-xl transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(prod.id)} className="p-2 glass text-red-400 hover:bg-white/10 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] uppercase font-bold text-blue-500 tracking-[0.2em] mb-1">{(prod as any).categories?.name}</p>
              <h3 className="text-xl font-bold mb-2 line-clamp-1">{prod.name}</h3>
              
              <div className="mt-auto pt-6 flex justify-between items-end border-t border-white/5">
                 <div>
                    <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-1">Stock</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${prod.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <p className={`font-black text-sm ${prod.stock < 5 ? 'text-red-400' : 'text-white'}`}>{prod.stock} Units</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-1">Price</p>
                    <p className="text-2xl font-black text-gradient">৳{prod.price.toLocaleString()}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass w-full max-w-3xl p-8 md:p-12 rounded-[3rem] relative my-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-black mb-10 tracking-tight uppercase text-gradient">{formData.id ? 'Edit Gadget' : 'New Gadget'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Area */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Product Visual</label>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="aspect-video w-full rounded-[2rem] overflow-hidden glass border border-white/10 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all text-gray-500 gap-4">
                      <Upload size={48} strokeWidth={1} />
                      <div className="text-center">
                        <p className="font-bold text-white text-sm">Upload Product Image</p>
                        <p className="text-xs uppercase tracking-widest mt-1">Click to select file</p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Gadget Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors text-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pentova X-1 Pro"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Category</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors appearance-none text-white"
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-black text-white">{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Market Price (৳)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors text-white"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Inventory Level</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors text-white"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Engineering Description</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors text-white"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the tech specs and key features..."
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-grow bg-white text-black py-5 rounded-full font-black hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Processing...
                    </>
                  ) : (
                    formData.id ? 'Save Changes' : 'Launch Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
