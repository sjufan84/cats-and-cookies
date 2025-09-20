"use client";

import { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes,
  placeholder = "empty"
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.error('Image failed to load:', src);
    setHasError(true);
  };

  // If there's an error, show a fallback
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🍪</div>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      placeholder={placeholder}
      onError={handleError}
      className={className}
    />
  );
}
