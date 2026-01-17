import { useState, useEffect } from 'react';
import MetallicPaint, { parseLogoImage } from './MetallicPaint';

export default function MetallicLogo() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDefaultImage() {
      try {
        const response = await fetch('/logo.svg');
        const blob = await response.blob();
        const file = new File([blob], "logo.svg", { type: blob.type });

        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading logo:", err);
        setIsLoading(false);
      }
    }

    loadDefaultImage();
  }, []);

  if (isLoading || !imageData) {
    return (
      <span className="font-bold text-lg">EL</span>
    );
  }

  return (
    <div className="w-full h-full">
      <MetallicPaint 
        imageData={imageData} 
        params={{ 
          edge: 2, 
          patternBlur: 0.005, 
          patternScale: 2, 
          refraction: 0.015, 
          speed: 0.3, 
          liquid: 0.07 
        }} 
      />
    </div>
  );
}
