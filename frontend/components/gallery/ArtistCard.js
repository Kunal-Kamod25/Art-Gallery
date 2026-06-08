'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ArtistCard({ artist }) {
  return (
    <Link href={`/artists/${artist._id}`} className="group block bg-white border border-neutral-100 card-hover overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {artist.profileImage ? (
          <Image src={artist.profileImage} alt={artist.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-display text-neutral-300">
            {artist.name[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">{artist.name}</h3>
        <p className="text-xs text-amber-600 tracking-wider mt-1">{artist.nationality}</p>
        <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{artist.bio}</p>
        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-neutral-700 group-hover:text-amber-600 transition-colors">
          View Works <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}
