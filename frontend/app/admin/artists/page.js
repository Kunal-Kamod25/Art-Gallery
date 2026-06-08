'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';

export default function AdminArtists() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', nationality: '', birthYear: '', profileImage: '', specialization: '', featured: false });

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    api.get('/artists?limit=100').then(r => setArtists(r.data.artists)).finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, birthYear: Number(form.birthYear), specialization: form.specialization.split(',').map(s => s.trim()).filter(Boolean) };
      if (editing) { await api.put(`/artists/${editing}`, payload); toast.success('Artist updated!'); }
      else { await api.post('/artists', payload); toast.success('Artist created!'); }
      const res = await api.get('/artists?limit=100');
      setArtists(res.data.artists);
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving artist'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this artist?')) return;
    await api.delete(`/artists/${id}`);
    setArtists(a => a.filter(x => x._id !== id));
    toast.success('Deleted');
  };

  const resetForm = () => { setEditing(null); setShowForm(false); setForm({ name: '', bio: '', nationality: '', birthYear: '', profileImage: '', specialization: '', featured: false }); };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-10 h-10 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-neutral-400 hover:text-neutral-900"><ArrowLeft size={20} /></Link>
          <h1 className="font-display text-3xl font-bold">Manage Artists</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="ml-auto btn-primary flex items-center gap-2 text-sm tracking-widest uppercase">
            <Plus size={16} /> Add Artist
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-neutral-200 p-8 mb-8">
            <h2 className="font-display text-xl font-bold mb-6">{editing ? 'Edit Artist' : 'Add New Artist'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
              {[['name','Name','text',false],['nationality','Nationality','text',false],['birthYear','Birth Year','number',false],['profileImage','Profile Image URL','text',false]].map(([key,label,type,full]) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key !== 'profileImage'} className="input-field text-sm" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} required className="input-field text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Specialization (comma-separated)</label>
                <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className="input-field text-sm" placeholder="Painting, Sculpture" />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4" />
                  Featured Artist
                </label>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="submit" className="btn-primary text-sm tracking-widest uppercase">{editing ? 'Update' : 'Create'} Artist</button>
                <button type="button" onClick={resetForm} className="btn-outline text-sm tracking-widest uppercase">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>{['Name','Nationality','Specialization','Featured','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {artists.map(a => (
                <tr key={a._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{a.nationality}</td>
                  <td className="px-4 py-3 text-neutral-500">{a.specialization?.join(', ') || '—'}</td>
                  <td className="px-4 py-3"><span className={a.featured ? 'text-amber-600 text-xs font-medium' : 'text-neutral-300 text-xs'}>{a.featured ? '★ Yes' : '—'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditing(a._id); setForm({ name: a.name, bio: a.bio, nationality: a.nationality, birthYear: a.birthYear || '', profileImage: a.profileImage || '', specialization: a.specialization?.join(', ') || '', featured: a.featured }); setShowForm(true); window.scrollTo(0,0); }} className="text-blue-500 hover:text-blue-700"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(a._id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
