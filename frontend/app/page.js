'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Award, Users, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import ArtworkCard from '../components/gallery/ArtworkCard';
import ArtistCard from '../components/gallery/ArtistCard';

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1600',
    subtitle: 'FEATURED COLLECTION',
    title: 'Where Art Speaks\nBeyond Words',
    desc: 'Discover original paintings, sculptures, and photography from world-class artists.'
  },
  {
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=1600',
    subtitle: 'NEW ARRIVALS 2024',
    title: 'Contemporary\nMasterpieces',
    desc: 'Explore our curated selection of cutting-edge contemporary art.'
  },
];

export default function HomePage() {
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slide, setSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    api.get('/artworks?featured=true&limit=8').then(r => setArtworks(r.data.artworks));
    api.get('/artists?featured=true&limit=4').then(r => setArtists(r.data.artists));
    api.get('/categories').then(r => setCategories(r.data.categories));

    // Create hero slides from featured artworks
    api.get('/artworks?featured=true&limit=6').then(r => {
      if (r.data.artworks && r.data.artworks.length > 0) {
        const slides = r.data.artworks.map((artwork, idx) => {
          const primaryImage = artwork.images?.find(img => img.isPrimary) || artwork.images?.[0];
          return {
            image: primaryImage?.url || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].image,
            subtitle: 'FEATURED ARTWORK',
            title: artwork.title,
            desc: artwork.description?.substring(0, 80) + '...' || 'Discover this beautiful artwork',
            artworkId: artwork._id
          };
        });
        setHeroSlides(slides.length > 0 ? slides : DEFAULT_SLIDES);
      }
    });

    const t = setInterval(() => setSlide(s => (s + 1) % Math.max(heroSlides.length, 1)), 6000);
    return () => clearInterval(t);
  }, []);

  const hero = heroSlides[slide] || DEFAULT_SLIDES[0];
  const totalSlides = heroSlides.length || DEFAULT_SLIDES.length;

  const nextSlide = () => setSlide((s) => (s + 1) % totalSlides);
  const prevSlide = () => setSlide((s) => (s - 1 + totalSlides) % totalSlides);

  return (
    <div className="overflow-hidden">
      {/* Hero Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 transition-all duration-1000">
          <Image src={hero.image} alt="Hero" fill className="object-cover" priority onError={() => {}} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <p className="text-amber-400 tracking-[0.3em] text-xs font-medium mb-4 animate-fade-in">{hero.subtitle}</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 whitespace-pre-line animate-slide-up">
            {hero.title}
          </h1>
          <p className="text-neutral-300 text-lg max-w-md mb-10 animate-fade-in">{hero.desc}</p>
          <div className="flex flex-wrap gap-4">
            {hero.artworkId ? (
              <Link href={`/artwork/${hero.artworkId}`} className="btn-gold flex items-center gap-2 text-sm tracking-widest uppercase">
                View Artwork <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/gallery" className="btn-gold flex items-center gap-2 text-sm tracking-widest uppercase">
                Explore Gallery <ArrowRight size={16} />
              </Link>
            )}
            <Link href="/artists" className="btn-outline border-white text-white hover:bg-white hover:text-neutral-900 text-sm tracking-widest uppercase">
              Meet the Artists
            </Link>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronRight size={24} className="text-white" />
        </button>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {Array(totalSlides).fill(0).map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`w-8 h-0.5 transition-all ${i === slide ? 'bg-amber-400 w-12' : 'bg-white/40'}`} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { icon: Palette, value: '500+', label: 'Original Artworks' },
            { icon: Users, value: '120+', label: 'Global Artists' },
            { icon: Award, value: '15+', label: 'Years of Excellence' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon size={24} className="text-amber-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">{value}</div>
              <div className="text-neutral-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-amber-600 tracking-widest text-xs uppercase font-medium mb-2">Curated Selection</p>
            <h2 className="section-title">Featured Artworks</h2>
          </div>
          <Link href="/gallery" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-amber-600 transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artworks.map(a => <ArtworkCard key={a._id} artwork={a} />)}
        </div>
        <div className="text-center mt-10 md:hidden">
          <Link href="/gallery" className="btn-outline text-sm tracking-widest uppercase">View All Works</Link>
        </div>
      </section>

      {/* Categories Banner */}
      {categories.length > 0 && (
        <section className="bg-stone-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="section-title text-center mb-10">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(cat => (
                <Link key={cat._id} href={`/gallery?category=${cat._id}`}
                  className="border border-neutral-300 px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Artists */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-amber-600 tracking-widest text-xs uppercase font-medium mb-2">The Creators</p>
            <h2 className="section-title">Featured Artists</h2>
          </div>
          <Link href="/artists" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-amber-600 transition-colors">
            All Artists <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map(a => <ArtistCard key={a._id} artist={a} />)}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600" alt="CTA" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
          <p className="text-amber-400 tracking-widest text-xs uppercase mb-4">Are You An Artist?</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Share Your Vision With the World</h2>
          <p className="text-neutral-300 mb-8">Join our community of world-class artists. Apply to exhibit your work in the Kalakriti Gallery.</p>
          <Link href="/auth/register" className="btn-gold text-sm tracking-widest uppercase inline-flex items-center gap-2">
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
