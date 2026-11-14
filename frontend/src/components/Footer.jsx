import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-700 p-1.5 flex items-center justify-center">
                <img src="/logo.svg" alt="Shubdum" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                  SHUBDUM
                </h3>
                <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
                  Chinese Corner &amp; Indian Kitchen
                </p>
              </div>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              Serving mouth-watering authentic Indo-Chinese and rich Indian delicacies prepared fresh with premium ingredients, aromatic spices, and lightning-fast wok fires.
            </p>
            <div className="pt-2">
              <a
                href="https://share.google/eSXsF3SXNVLvtKeSu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors bg-stone-800/80 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                View Google Business Listing
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Restaurant Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Visit &amp; Contact
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Thane East, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>11:30 AM &ndash; 11:30 PM Daily</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Direct Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/order" className="text-stone-400 hover:text-white transition-colors">
                  Full Menu &amp; Ordering
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-stone-400 hover:text-white transition-colors">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-stone-400 hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Staff / Admin Login
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Shubdum Chinese Corner &amp; Indian Kitchen. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Freshly prepared with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Thane East
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

