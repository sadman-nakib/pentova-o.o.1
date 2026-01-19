
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { Plus, Trash2, Tag, Loader2, X } from 'lucide-react';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    const slug = newName.toLowerCase().trim().replace(/\s+/g, '-');

    try {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', newName.trim())
        .single();

      if (existing) {
        alert('A category with this name already exists.');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newName.trim(),
          slug
        });

      if (error) throw error;

      setNewName('');
      fetchCategories();
    } catch (err: any) {
      console.error('Error adding category:', err);
      alert(err.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This might affect products linked to it.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category. Check if it is still being used by products.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-gradient">Taxonomy</h1>
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mt-2">Manage Product Categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/5 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 tracking-tight uppercase">New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Display Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors text-white"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Smart Wearables"
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting || !newName.trim()}
                className="w-full bg-white text-black py-4 rounded-full font-black hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* Category List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 glass rounded-3xl animate-pulse"></div>)}
            </div>
          ) : categories.length === 0 ? (
            <div className="glass p-12 rounded-[2.5rem] text-center border border-white/5">
              <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No categories defined yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="glass p-6 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-blue-500">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{cat.name}</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">/{(cat as any).slug}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
