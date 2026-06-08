import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h2 className="font-display text-3xl text-white font-bold tracking-widest mb-4">LUMINARY</h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            A curated space where extraordinary art meets passionate collectors. We champion emerging and established artists worldwide.
          </p>
          <div className="flex gap-4 mt-6">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 border border-neutral-700 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold tracking-widest text-xs uppercase mb-5">Explore</h4>
          <ul className="space-y-3 text-sm">
            {[['Gallery', '/gallery'], ['Artists', '/artists'], ['Featured Works', '/gallery?featured=true'], ['New Arrivals', '/gallery?sort=newest']].map(([l, h]) => (
              <li key={l}><Link href={h} className="hover:text-amber-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold tracking-widest text-xs uppercase mb-5">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><MapPin size={14} className="text-amber-500" /> 22 Art Gallery, Nashik, Maharashtra, India 422101</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-amber-500" /> +91 9420219815</li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-amber-500" />artgallery@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 px-6 py-5 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()}  Luminary Art Gallery. All rights reserved.</p>
        <div className="flex gap-5 mt-2 md:mt-0">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
