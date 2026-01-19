
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Heart, Share2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, ProductImage } from '../types';
import { useAuth } from '../App';

const ProductDetail: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_images(*), categories(*)`)
        .eq('id', productId)
        .single();

      if (data) {
        setProduct(data as any);
        if (data.image_url) {
          setActiveImage(data.image_url);
        } else if ((data as any).product_images?.length > 0) {
          setActiveImage((data as any).product_images[0].image_url);
        } else {
          setActiveImage(`https://picsum.photos/seed/${data.id}/800/800`);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    try {
      // Check if item already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ 
            user_id: user.id, 
            product_id: product.id, 
            quantity 
          });
      }
      
      alert('Added to cart!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <h1 className="text-4xl font-bold mb-4">Product not found.</h1>
      <button onClick={() => navigate(-1)} className="text-blue-500 underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors">
        <ArrowLeft size={18} /> Back to collections
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Images */}
        <div className="space-y-6">
          <div className="aspect-square glass rounded-[3rem] overflow-hidden group">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.image_url && (
              <button 
                onClick={() => setActiveImage(product.image_url!)}
                className={`w-20 h-20 flex-shrink-0 glass rounded-2xl overflow-hidden border-2 transition-all ${activeImage === product.image_url ? 'border-white' : 'border-transparent'}`}
              >
                <img src={product.image_url} className="w-full h-full object-cover" />
              </button>
            )}
            {(product as any).product_images?.map((img: ProductImage) => (
              <button 
                key={img.id}
                onClick={() => setActiveImage(img.image_url)}
                className={`w-20 h-20 flex-shrink-0 glass rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.image_url ? 'border-white' : 'border-transparent'}`}
              >
                <img src={img.image_url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-500 text-xs font-bold tracking-[0.3em] uppercase mb-3">{(product as any).categories?.name}</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mt-4">
                 <p className="text-3xl font-black text-gradient">৳{product.price.toLocaleString()}</p>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Sold Out'}
                 </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 glass rounded-full hover:bg-white/10 transition-colors">
                <Heart size={20} />
              </button>
              <button className="p-3 glass rounded-full hover:bg-white/10 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6 mb-10 text-gray-400 leading-relaxed font-light">
            <p>{product.description}</p>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center glass rounded-full px-4 py-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-white text-xl font-bold"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-white text-xl font-bold"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-grow bg-white text-black h-14 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : (
                  <>
                    <ShoppingCart size={20} /> Add to Cart
                  </>
                )}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
            <div className="flex flex-col items-center text-center">
              <Truck size={24} className="text-gray-400 mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Free Shipping</p>
              <p className="text-[11px] text-gray-400 mt-1">On orders over ৳50k</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck size={24} className="text-gray-400 mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure Payment</p>
              <p className="text-[11px] text-gray-400 mt-1">Cash on Delivery</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <RefreshCw size={24} className="text-gray-400 mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">7 Day Return</p>
              <p className="text-[11px] text-gray-400 mt-1">Hassle-free process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
