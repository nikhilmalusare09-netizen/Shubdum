import React from 'react';

const VegBadge = ({ isVeg, size = 'md' }) => {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4.5 h-4.5';
  const dotDim = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  if (isVeg === 'UNASSIGNED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded">
        Unassigned
      </span>
    );
  }

  const isVegetarian = isVeg === true || isVeg === 'VEG';

  return (
    <div
      className={`inline-flex items-center justify-center border-2 rounded-sm ${dim} ${
        isVegetarian
          ? 'border-emerald-600 bg-emerald-50/50'
          : 'border-red-600 bg-red-50/50'
      }`}
      title={isVegetarian ? 'Pure Vegetarian' : 'Non-Vegetarian'}
    >
      <div
        className={`rounded-full ${dotDim} ${
          isVegetarian ? 'bg-emerald-600' : 'bg-red-600'
        }`}
      />
    </div>
  );
};

export default VegBadge;

