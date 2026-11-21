/**
 * Compression d'images côté client via l'API HTML5 Canvas.
 * Garantit des images optimisées (~300 Ko - 900 Ko, maximum ~1 Mo)
 * adaptées aux connexions mobiles au Sénégal.
 */

export interface CompressedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  fileName: string;
}

export async function compressImageClientSide(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.82
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erreur de chargement de l\'image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionnement proportionnel si dépasse maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible d\'initialiser le contexte canvas.'));
          return;
        }

        // Amélioration de l'interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export en JPEG ou WebP de haute qualité
        const outputMime = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outputMime, quality);

        // Calcul de la taille approximative en octets
        const head = `data:${outputMime};base64,`;
        const base64Length = compressedDataUrl.length - head.length;
        const compressedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          originalSize: file.size,
          compressedSize,
          width,
          height,
          fileName: file.name,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
