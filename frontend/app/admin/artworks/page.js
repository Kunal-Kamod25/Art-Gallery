'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';

export default function AdminArtworks() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [userArtist, setUserArtist] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', artist: '', category: '', price: '',
    medium: '', year: new Date().getFullYear(), edition: 'Original',
    images: [], tags: '', isAvailable: true, isFeatured: false,
    dimensions: { width: '', height: '', unit: 'cm' }
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'artist')) { router.push('/'); return; }

    const loadData = async () => {
      try {
        const categoryRequest = api.get('/categories');
        if (user.role === 'artist') {
          const artistRes = await api.get(`/artists?limit=1&user=${user._id}`);
          const currentArtist = artistRes.data.artists[0] || null;
          setUserArtist(currentArtist);
          setArtists(currentArtist ? [currentArtist] : []);
          const artworkRes = await api.get(`/artworks?limit=50${currentArtist ? `&artist=${currentArtist._id}` : ''}`);
          setArtworks(artworkRes.data.artworks);
          const categoryRes = await categoryRequest;
          setCategories(categoryRes.data.categories);
        } else {
          const [artworkRes, artistRes, categoryRes] = await Promise.all([
            api.get('/artworks?limit=50'),
            api.get('/artists?limit=100'),
            categoryRequest,
          ]);
          setArtworks(artworkRes.data.artworks);
          setArtists(artistRes.data.artists);
          setCategories(categoryRes.data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
    if (!form.year) newErrors.year = 'Year is required';
    if (selectedFiles.length === 0 && !editing) newErrors.images = 'At least one image is required';
    if (user?.role === 'admin' && !form.artist) newErrors.artist = 'Artist is required for admin';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      console.log('Validation errors:', newErrors);
      return;
    }

    setErrors({});
    setUploading(true);
    try {
      console.log('Starting artwork submission...', { editing, selectedFiles: selectedFiles.length });
      
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('medium', form.medium);
      formData.append('year', form.year);
      formData.append('edition', form.edition);
      formData.append('tags', form.tags);
      formData.append('isAvailable', form.isAvailable);
      formData.append('isFeatured', form.isFeatured);
      formData.append('dimensions', JSON.stringify(form.dimensions));

      if (user?.role === 'admin') {
        formData.append('artist', form.artist);
      }

      // Add selected files
      selectedFiles.forEach((file, index) => {
        console.log(`Adding image ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        formData.append('images', file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editing) {
        console.log('Updating artwork:', editing);
        await api.put(`/artworks/${editing}`, formData, config);
        toast.success('Artwork updated!');
      } else {
        console.log('Creating new artwork...');
        await api.post('/artworks', formData, config);
        toast.success('Artwork created!');
      }

      console.log('Reloading artworks...');
      // Reload artworks
      const res = await api.get('/artworks?limit=50');
      setArtworks(res.data.artworks);
      resetForm();
    } catch (err) {
      console.error('Artwork submission error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Error saving artwork';
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this artwork?')) return;
    await api.delete(`/artworks/${id}`);
    setArtworks(a => a.filter(x => x._id !== id));
    toast.success('Deleted');
  };

  const startEdit = (artwork) => {
    setEditing(artwork._id);
    setForm({
      title: artwork.title, description: artwork.description,
      artist: artwork.artist?._id || '', category: artwork.category?._id || '',
      price: artwork.price, medium: artwork.medium, year: artwork.year,
      edition: artwork.edition, images: artwork.images || [],
      tags: artwork.tags?.join(', ') || '', isAvailable: artwork.isAvailable,
      isFeatured: artwork.isFeatured,
      dimensions: artwork.dimensions || { width: '', height: '', unit: 'cm' }
    });
    setSelectedFiles([]);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setSelectedFiles([]);
    setErrors({});
    setForm({
      title: '', description: '', artist: userArtist?._id || '', category: '',
      price: '', medium: '', year: new Date().getFullYear(), edition: 'Original',
      images: [], tags: '', isAvailable: true, isFeatured: false,
      dimensions: { width: '', height: '', unit: 'cm' }
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeExistingImage = async (imageId) => {
    if (!editing) return;
    try {
      await api.delete(`/artworks/${editing}/images/${imageId}`);
      const updatedArtwork = await api.get(`/artworks/${editing}`);
      setForm(f => ({ ...f, images: updatedArtwork.data.artwork.images }));
      toast.success('Image removed');
    } catch (err) {
      toast.error('Failed to remove image');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-10 h-10 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-neutral-400 hover:text-neutral-900"><ArrowLeft size={20} /></Link>
          <h1 className="font-display text-3xl font-bold">Manage Artworks</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="ml-auto btn-primary flex items-center gap-2 text-sm tracking-widest uppercase">
            <Plus size={16} /> Add Artwork
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-neutral-200 p-8 mb-8">
            <h2 className="font-display text-xl font-bold mb-6">{editing ? 'Edit Artwork' : 'Add New Artwork'}</h2>
            
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{errors.submit}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className={`input-field text-sm ${errors.title ? 'border-red-500' : ''}`} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} required className={`input-field text-sm resize-none ${errors.description ? 'border-red-500' : ''}`} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              {user?.role === 'admin' ? (
                <div>
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Artist *</label>
                  <select value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} required className={`input-field text-sm ${errors.artist ? 'border-red-500' : ''}`}>
                    <option value="">Select Artist</option>
                    {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                  {errors.artist && <p className="text-red-500 text-xs mt-1">{errors.artist}</p>}
                </div>
              ) : (
                <div className="col-span-2">
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Artist</label>
                  <div className="rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700 bg-neutral-50">
                    {userArtist?.name || 'Your Artist Profile'}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required className={`input-field text-sm ${errors.category ? 'border-red-500' : ''}`}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className={`input-field text-sm ${errors.price ? 'border-red-500' : ''}`} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Medium</label>
                  <div className="group relative">
                    <span className="text-neutral-400 text-xs cursor-help">ⓘ</span>
                    <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-neutral-900 text-white text-xs rounded whitespace-nowrap z-10">
                      E.g., Oil on Canvas, Watercolor, Acrylic, Digital Art, Bronze Sculpture
                    </div>
                  </div>
                </div>
                <input value={form.medium} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))} className="input-field text-sm" placeholder="e.g., Oil on Canvas" />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Year *</label>
                <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required className={`input-field text-sm ${errors.year ? 'border-red-500' : ''}`} />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Width (cm)</label>
                <input type="number" value={form.dimensions.width} onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, width: e.target.value } }))} className="input-field text-sm" placeholder="100" />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Height (cm)</label>
                <input type="number" value={form.dimensions.height} onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, height: e.target.value } }))} className="input-field text-sm" placeholder="80" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Upload Images * {editing && <span className="text-neutral-500">(optional to update)</span>}</label>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className={`input-field text-sm ${errors.images ? 'border-red-500' : ''}`} />
                <p className="text-xs text-neutral-500 mt-1">Select multiple images. First image will be primary. Max 5MB per image.</p>
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">✓ {selectedFiles.length} file(s) selected</p>
                )}
                {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
              </div>
              {editing && form.images.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Current Images</label>
                  <div className="flex gap-2 flex-wrap">
                    {form.images.map((img, index) => (
                      <div key={img._id || index} className="relative">
                        <Image src={img.url} alt="" width={64} height={64} className="w-16 h-16 object-cover border rounded" />
                        {img.isPrimary && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded">Primary</span>}
                        <button type="button" onClick={() => removeExistingImage(img._id)} className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field text-sm" placeholder="abstract, bold, colorful" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} className="w-4 h-4" />
                  Available
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4" />
                  Featured
                </label>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={uploading} className="btn-primary text-sm tracking-widest uppercase disabled:opacity-50">
                  {uploading ? 'Uploading...' : (editing ? 'Update Artwork' : 'Create Artwork')}
                </button>
                <button type="button" onClick={resetForm} className="btn-outline text-sm tracking-widest uppercase">Cancel</button>
              </div>

            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>{['Title', 'Artist', 'Category', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {artworks.map(a => (
                <tr key={a._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium max-w-[180px] truncate">{a.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{a.artist?.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{a.category?.name}</td>
                  <td className="px-4 py-3 font-medium">₹{a.price?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 font-medium ${a.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {a.isAvailable ? 'Available' : 'Sold'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${a.isFeatured ? 'text-amber-600' : 'text-neutral-300'}`}>{a.isFeatured ? '★ Yes' : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(a)} className="text-blue-500 hover:text-blue-700"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(a._id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {artworks.length === 0 && <p className="text-center py-12 text-neutral-400">No artworks found</p>}
        </div>
      </div>
    </div>
  );
}
