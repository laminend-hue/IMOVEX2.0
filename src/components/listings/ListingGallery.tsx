import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';
import { ListingPhoto } from '../../types/database.ts';

interface ListingGalleryProps {
  photos: ListingPhoto[];
  title: string;
}

export const ListingGallery: React.FC<ListingGalleryProps> = ({ photos, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-16/9 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
        <ImageIcon className="w-10 h-10 mb-2" />
        <span className="text-sm">Aucune photo disponible</span>
      </div>
    );
  }

  const currentPhoto = photos[selectedIndex] || photos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Photo principale */}
      <div
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-16/9 w-full bg-slate-900 rounded-2xl overflow-hidden cursor-zoom-in group shadow-xs"
      >
        <img
          src={currentPhoto.publicUrl}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
        />

        {/* Boutons précédent / suivant */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Compteur et bouton d'agrandissement */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>
            {selectedIndex + 1} / {photos.length}
          </span>
        </div>
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((photo, index) => (
            <button
              key={photo.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === index
                  ? 'border-emerald-600 scale-95 shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={photo.publicUrl}
                alt={`Miniature ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox plein écran */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8"
        >
          <div className="flex items-center justify-between text-white pb-4">
            <span className="text-sm font-semibold truncate max-w-md">
              {title} — Photo {selectedIndex + 1} / {photos.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Fermer la vue plein écran"
              className="p-2 text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            <img
              src={currentPhoto.publicUrl}
              alt={`${title} plein écran`}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-white/60 text-xs py-2">
            Appuyez sur Échap ou le bouton de fermeture pour quitter
          </div>
        </div>
      )}
    </div>
  );
};
