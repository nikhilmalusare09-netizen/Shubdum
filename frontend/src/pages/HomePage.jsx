import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UtensilsCrossed, Shield, MapPin, Clock, Flame, 
  Sparkles, Award, ArrowRight, CheckCircle2, ChevronRight, PhoneCall 
} from 'lucide-react';
import VegBadge from '../components/VegBadge';

const HomePage = () => {
  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-950 via-stone-900 to-stone-950 text-white pt-12 pb-24 lg:py-24">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-900/60 border border-red-700/60 text-amber-300 text-xs font-semibold tracking-wide">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Authentic Chinese Corner &amp; Indian Kitchen &bull; Thane East</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Sizzling Woks, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-orange-400">
                  Unforgettable Flavors.
                </span>
              </h1>

              <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Welcome to <strong className="text-white font-semibold">Shubdum Chinese Corner &amp; Indian Kitchen</strong>. 
                Experience instant digital ordering directly from your table. No app downloads, no login or registration needed—just pure delicious food.
              </p>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/order"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-red-900/40 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <UtensilsCrossed className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Start Ordering Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 font-semibold text-sm transition-all"
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Admin Portal</span>
                </Link>
              </div>

              {/* Quick Info Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-400 border-t border-stone-800/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Thane East, Maharashtra</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Fast Dine-in Preparation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Live Table Bill</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Food Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800/80 aspect-square relative group">
                  <img
                    src="https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80"
                    alt="Crispy Appetizers"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider mb-2 w-max">
                      Signature Dish
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white">
                      Crispy Chicken &amp; Schezwan Dry
                    </h3>
                    <p className="text-xs text-stone-300">Wok-fired with fresh Sichuan chilies &amp; garlic</p>
                  </div>
                </div>

                {/* Floating Dish Badge 1 */}
                <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white text-stone-900 rounded-2xl p-4 shadow-xl border border-stone-200 flex items-center gap-3.5 max-w-[240px]">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=200&q=80"
                      alt="Manchow Soup"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block">Veg Special</span>
                    <p className="text-xs font-bold leading-tight">Manchow Soup</p>
                    <span className="text-xs font-extrabold text-red-700">₹170</span>
                  </div>
                </div>

                {/* Floating Dish Badge 2 */}
                <div className="hidden sm:flex absolute -top-6 -right-6 bg-stone-900 text-white rounded-2xl p-3.5 shadow-xl border border-stone-800 items-center gap-3 max-w-[210px]">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Piping Hot</p>
                    <span className="text-[11px] text-stone-400">Triple Schezwan Rice</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STEP 1: FOOD TYPE SELECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Quick Start Step 1
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-3">
            Choose Your Food Preference
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Select your preferred dining style to view curated dishes with transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* VEG FOOD CARD */}
          <Link
            to="/order?type=VEG"
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 text-white p-8 sm:p-10 shadow-xl shadow-emerald-900/10 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[300px]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <div className="w-7 h-7 border-2 border-white rounded-md flex items-center justify-center">
                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
                  </div>
                </div>
                <span className="bg-white/25 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                  Pure Veg Delicacies
                </span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-bold mt-6 tracking-tight">
                VEG FOOD
              </h3>
              <p className="text-emerald-100 text-sm mt-2 max-w-sm leading-relaxed">
                Paneer Crispy, Manchow Soup, Veg Hakka Noodles, American Chopsuey &amp; Specialty Gravies.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex items-center justify-between border-t border-white/20 mt-6">
              <span className="text-sm font-bold tracking-wide flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Explore Veg Menu
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs bg-emerald-800/40 px-3 py-1 rounded-full font-semibold">
                60+ Dishes
              </span>
            </div>
          </Link>

          {/* NON-VEG FOOD CARD */}
          <Link
            to="/order?type=NON_VEG"
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-rose-700 to-red-900 text-white p-8 sm:p-10 shadow-xl shadow-red-900/10 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[300px]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <div className="w-7 h-7 border-2 border-white rounded-md flex items-center justify-center">
                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
                  </div>
                </div>
                <span className="bg-white/25 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                  Non-Veg Delicacies
                </span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-bold mt-6 tracking-tight">
                NON-VEG FOOD
              </h3>
              <p className="text-red-100 text-sm mt-2 max-w-sm leading-relaxed">
                Chicken Lollipop, Chicken 65, Prawns Fried Rice, Chicken Chilli Gravy, Pot Rice &amp; Extras.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex items-center justify-between border-t border-white/20 mt-6">
              <span className="text-sm font-bold tracking-wide flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Explore Non-Veg Menu
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs bg-red-950/40 px-3 py-1 rounded-full font-semibold">
                30+ Dishes
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white rounded-3xl border border-stone-200/80 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Effortless Dining in 4 Simple Steps
          </h2>
          <p className="text-stone-500 text-sm mt-2">
            No registration or account creation required. Seamless dine-in ordering directly from your phone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white font-bold flex items-center justify-center text-sm shadow">
              01
            </div>
            <h3 className="font-bold text-stone-900 text-base">Select Preference</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tap Veg or Non-Veg to instantly display dishes matching your dietary choice.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow">
              02
            </div>
            <h3 className="font-bold text-stone-900 text-base">Add Dishes to Cart</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Review transparent unit prices and adjust portions. Live bill recalculates automatically.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-red-800 text-white font-bold flex items-center justify-center text-sm shadow">
              03
            </div>
            <h3 className="font-bold text-stone-900 text-base">Pick Your Table</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Enter your name and mobile number, then select your table (Table 01 to 10) from the live seating map.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
              04
            </div>
            <h3 className="font-bold text-stone-900 text-base">Track &amp; Enjoy</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Receive your secure tracking token. Watch live status updates from kitchen approval to table serving!
            </p>
          </div>
        </div>
      </section>

      {/* LOCATION & GOOGLE BUSINESS CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Visit Us in Person
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Shubdum Chinese Corner &amp; Indian Kitchen
            </h3>
            <p className="text-stone-300 text-sm max-w-xl">
              Located in the heart of Thane East, Maharashtra. Known for our rich flavors, quick preparation, and friendly restaurant hospitality.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4">
            <a
              href="https://share.google/eSXsF3SXNVLvtKeSu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Google Business Listing
            </a>
            <Link
              to="/order"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              Browse Today's Menu
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

