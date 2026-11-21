import React from 'react';

export const IMOVE_LOGO_SRC = '/assets/brand/logo.svg';

interface ImovexLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  alt?: string;
}

export const ImovexLogo: React.FC<ImovexLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
  alt = 'imovex Dakar',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden shadow-xs bg-[#0b162c] border border-slate-700/50 ${sizeMap[size]} ${className}`}
    >
      <img
        src={IMOVE_LOGO_SRC}
        alt={alt}
        className="w-full h-full object-cover select-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

interface ImovexLoaderProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const ImovexLoader: React.FC<ImovexLoaderProps> = ({
  message = 'Chargement...',
  submessage = 'imovex · Locations immobilières à Dakar',
  size = 'md',
  fullScreen = false,
}) => {
  const logoSize = size === 'sm' ? 'w-12 h-12 rounded-xl' : size === 'lg' ? 'w-24 h-24 rounded-3xl' : 'w-16 h-16 rounded-2xl';

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
      {/* Logo animé avec halo lumineux */}
      <div className="relative mb-5">
        <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-3xl opacity-35 blur-md animate-pulse" />
        <div className={`relative ${logoSize} overflow-hidden bg-[#0b162c] border border-sky-500/40 shadow-xl flex items-center justify-center`}>
          <img
            src={IMOVE_LOGO_SRC}
            alt="imovex Dakar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Spinner et texte */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {message}
        </span>
      </div>

      {submessage && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {submessage}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-md transition-colors">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[240px] flex items-center justify-center py-12">
      {content}
    </div>
  );
};
