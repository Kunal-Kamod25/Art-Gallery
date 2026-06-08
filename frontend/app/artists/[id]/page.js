'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Globe, Instagram, Twitter } from 'lucide-react';
import api from '../../../lib/api';
import ArtworkCard from '../../../components/gallery/ArtworkCard';

export default function ArtistDetailPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/artists/${id}`).then(r => {
      setArtist(r.data.artist);
      setArtworks(r.data.artworks);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
  if (!artist) return null;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <div className="bg-neutral-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-40 h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-amber-500">
            {artist.profileImage
              ? <Image src={artist.profileImage} alt={artist.name} fill className="object-cover" />
              : <div className="w-full h-full bg-neutral-700 flex items-center justify-center font-display text-5xl">{artist.name[0]}</div>
            }
          </div>
          <div>
            <p className="text-amber-400 tracking-widest text-xs uppercase mb-2">{artist.nationality} · {artist.birthYear && `b. ${artist.birthYear}`}</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{artist.name}</h1>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl">{artist.bio}</p>
            <div className="flex gap-4 mt-5">
              {artist.socialLinks?.website && (
                <a href={`https://${artist.socialLinks.website}`} target="_blank" rel="noopener"
                  className="flex items-center gap-2 text-xs text-neutral-300 hover:text-amber-400 transition-colors">
                  <Globe size={14} /> Website
                </a>
              )}
              {artist.socialLinks?.instagram && (
                <a href={`https://instagram.com/${artist.socialLinks.instagram}`} target="_blank" rel="noopener"
                  className="flex items-center gap-2 text-xs text-neutral-300 hover:text-amber-400 transition-colors">
                  <Instagram size={14} /> @{artist.socialLinks.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specializations */}
      {artist.specialization?.length > 0 && (
        <div className="border-b">
          <div className="max-w-5xl mx-auto px-6 py-5 flex gap-3">
            {artist.specialization.map(s => (
              <span key={s} className="text-xs tracking-widest uppercase border border-amber-300 text-amber-700 px-3 py-1">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Artworks */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-bold mb-10">Works by {artist.name}</h2>
        {artworks.length === 0
          ? <p className="text-neutral-400 text-center py-16">No artworks available yet.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {artworks.map(a => <ArtworkCard key={a._id} artwork={a} />)}
            </div>
        }
      </div>
    </div>
  );
}
