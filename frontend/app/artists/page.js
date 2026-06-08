'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import ArtistCard from '../../components/gallery/ArtistCard';

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/artists?page=${page}&limit=12`).then(r => {
      setArtists(r.data.artists);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-neutral-900 text-white py-20 text-center">
        <p className="text-amber-400 tracking-[0.3em] text-xs uppercase mb-3">The Creators</p>
        <h1 className="font-display text-5xl font-bold">Our Artists</h1>
        <p className="text-neutral-400 mt-3 text-sm">{total} artists represented</p>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white animate-pulse">
                <div className="aspect-square bg-neutral-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {artists.map(a => <ArtistCard key={a._id} artist={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
