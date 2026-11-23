import React, { useState } from 'react';
import { X, Upload, Trash2, AlertCircle, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Listing, ListingPhoto, PropertyType } from '../../types/database.ts';
import { compressImageClientSide } from '../../lib/utils/imageCompression.ts';
import { useApp } from '../../lib/store/appStore.tsx';

interface AgencyListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingToEdit?: Listing | null;
}

const COMMON_FEATURES = [
  'Climatisation',
  'Groupe électrogène',
  'Cuve d\'eau & surpresseur',
  'Gardiennage 24/7',
  'Ascenseur',
  'Parking sécurisé',
  'Balcon / Terrasse',
  'Cuisine équipée',
  'Chauffe-eau',
  'Piscine',
  'Fibre optique disponible',
];

export const AgencyListingFormModal: React.FC<AgencyListingFormModalProps> = ({
  isOpen,
  onClose,
  listingToEdit,
}) => {
  const { neighborhoods, activeAgency, addListing, updateListing } = useApp();

  const [title, setTitle] = useState(listingToEdit?.title || '');
  const [propertyType, setPropertyType] = useState<PropertyType>(listingToEdit?.propertyType || 'appartement');
  const [neighborhoodId, setNeighborhoodId] = useState(listingToEdit?.neighborhoodId || (neighborhoods[0]?.id || ''));
  const [monthlyRent, setMonthlyRent] = useState<number | ''>(listingToEdit?.monthlyRent || '');
  const [depositAdvance, setDepositAdvance] = useState<number | ''>(listingToEdit?.depositAdvance || '');
  const [chargesIncluded, setChargesIncluded] = useState(listingToEdit?.chargesIncluded || false);
  const [bedrooms, setBedrooms] = useState<number>(listingToEdit?.bedrooms ?? 2);
  const [bathrooms, setBathrooms] = useState<number>(listingToEdit?.bathrooms ?? 2);
  const [surfaceArea, setSurfaceArea] = useState<number | ''>(listingToEdit?.surfaceArea || '');
  const [isFurnished, setIsFurnished] = useState(listingToEdit?.isFurnished || false);
  const [description, setDescription] = useState(listingToEdit?.description || '');
  const [features, setFeatures] = useState<string[]>(listingToEdit?.features || ['Climatisation', 'Gardiennage 24/7', 'Cuve d\'eau & surpresseur']);

  // Photos state (each photo has dataUrl / publicUrl)
  const [photos, setPhotos] = useState<ListingPhoto[]>(listingToEdit?.photos || []);
  const [compressing, setCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFeatureToggle = (featureName: string) => {
    setFeatures((prev) =>
      prev.includes(featureName) ? prev.filter((f) => f !== featureName) : [...prev, featureName]
    );
  };

  // Image file handler with client-side canvas compression
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 10) {
      setErrorMsg('Le nombre total de photos ne peut pas dépasser 10.');
      return;
    }

    setCompressing(true);
    setErrorMsg(null);

    const newPhotos: ListingPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageClientSide(file, 1600, 0.82);
        newPhotos.push({
          id: `photo-${Date.now()}-${i}`,
          listingId: listingToEdit?.id || 'temp',
          storagePath: compressed.fileName,
          publicUrl: compressed.dataUrl,
          position: photos.length + i,
          isPrimary: photos.length === 0 && i === 0,
        });
      } catch (err: any) {
        console.error('Erreur compression image:', err);
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setCompressing(false);
    e.target.value = ''; // Reset input
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // Ensure at least one primary photo exists
      if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setPhotos((prev) =>
      prev.map((p, idx) => ({ ...p, isPrimary: idx === index }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Le titre de l\'annonce est obligatoire.');
      return;
    }

    if (!monthlyRent || monthlyRent <= 0) {
      setErrorMsg('Le montant du loyer mensuel en FCFA est obligatoire.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Veuillez renseigner un descriptif du logement.');
      return;
    }

    // Règle du cahier des charges : 3 à 10 photos
    if (photos.length < 3) {
      setErrorMsg(`Veuillez ajouter au moins 3 photos pour cette annonce (${photos.length}/3 ajoutées).`);
      return;
    }

    const selectedNeigh = neighborhoods.find((n) => n.id === neighborhoodId) || neighborhoods[0];

    setIsSubmitting(true);

    try {
      if (listingToEdit) {
        updateListing(listingToEdit.id, {
          title: title.trim(),
          propertyType,
          neighborhoodId: selectedNeigh.id,
          neighborhoodName: selectedNeigh.name,
          monthlyRent: Number(monthlyRent),
          depositAdvance: Number(depositAdvance) || 0,
          chargesIncluded,
          bedrooms,
          bathrooms,
          surfaceArea: surfaceArea ? Number(surfaceArea) : undefined,
          isFurnished,
          description: description.trim(),
          features,
          photos,
        });
      } else {
        await addListing({
          agencyId: activeAgency?.id || 'agency-teranga',
          agencyName: activeAgency?.name || 'Agence Immobilière',
          neighborhoodId: selectedNeigh.id,
          neighborhoodName: selectedNeigh.name,
          title: title.trim(),
          propertyType,
          city: 'Dakar',
          monthlyRent: Number(monthlyRent),
          depositAdvance: Number(depositAdvance) || 0,
          chargesIncluded,
          bedrooms,
          bathrooms,
          surfaceArea: surfaceArea ? Number(surfaceArea) : undefined,
          isFurnished,
          description: description.trim(),
          features,
          status: 'en_attente',
          photos,
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Erreur lors de la sauvegarde de l\'annonce.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Espace Agence Partenaire
            </span>
            <h2 className="text-lg font-bold">
              {listingToEdit ? 'Modifier l\'annonce' : 'Publier une nouvelle annonce'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Titre de l'annonce <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Bel appartement F4 vue mer aux Almadies"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type & Quartier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type de bien <span className="text-rose-500">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize cursor-pointer"
              >
                <option value="appartement">Appartement</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="maison">Maison</option>
                <option value="chambre">Chambre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quartier (Dakar) <span className="text-rose-500">*</span>
              </label>
              <select
                value={neighborhoodId}
                onChange={(e) => setNeighborhoodId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {neighborhoods.filter(n => n.isActive).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loyer, Caution et Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Loyer mensuel (FCFA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={10000}
                placeholder="Ex : 450000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Caution / Avance (FCFA)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Ex : 900000"
                value={depositAdvance}
                onChange={(e) => setDepositAdvance(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chargesIncluded}
                  onChange={(e) => setChargesIncluded(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Charges de copropriété incluses</span>
              </label>
            </div>
          </div>

          {/* Chambres, Salles d'eau, Surface, Meublé */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chambres
              </label>
              <input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Salles de bain
              </label>
              <input
                type="number"
                min={1}
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Surface (m²)
              </label>
              <input
                type="number"
                min={10}
                placeholder="Ex : 120"
                value={surfaceArea}
                onChange={(e) => setSurfaceArea(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFurnished}
                  onChange={(e) => setIsFurnished(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Logement meublé</span>
              </label>
            </div>
          </div>

          {/* Photos (3 à 10 requises avec compression automatique) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Photos de l'annonce ({photos.length} / 10)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ajoutez entre 3 et 10 photos nettes. Compression automatique côté client (~1 Mo max chacune).
                </p>
              </div>

              {photos.length < 10 && (
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ajouter des photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesSelected}
                    className="hidden"
                    disabled={compressing}
                  />
                </label>
              )}
            </div>

            {compressing && (
              <div className="py-3 text-xs text-emerald-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compression des photos en cours...</span>
              </div>
            )}

            {/* Grille des photos déjà ajoutées */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                {photos.map((photo, index) => (
                  <div key={photo.id || index} className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 group bg-slate-200">
                    <img
                      src={photo.publicUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {photo.isPrimary && (
                      <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        Principale
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {!photo.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryPhoto(index)}
                          title="Définir comme photo principale"
                          className="p-1 rounded bg-white text-slate-800 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer text-[10px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        title="Supprimer la photo"
                        className="p-1 rounded bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <span>Aucune photo sélectionnée pour le moment (3 minimum requises)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description détaillée <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Décrivez les pièces, l'étage, les atouts de l'immeuble, la proximité des commodités (écoles, commerces, transports)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Caractéristiques & Équipements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Équipements & Prestations
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_FEATURES.map((feat) => (
                <label
                  key={feat}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                    features.includes(feat)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={features.includes(feat)}
                    onChange={() => handleFeatureToggle(feat)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>{feat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Sauvegarde en cours...</span>
              ) : (
                <span>{listingToEdit ? 'Mettre à jour l\'annonce' : 'Publier l\'annonce'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
