import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause } from 'lucide-react';

interface Product360ViewerProps {
  images: string[];
  productName: string;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto rotation
  useEffect(() => {
    if (isAutoRotating) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRotating, images.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const sensitivity = 3;
    const steps = Math.floor(Math.abs(deltaX) / sensitivity);

    if (steps > 0) {
      if (deltaX > 0) {
        setCurrentIndex((prev) => (prev + steps) % images.length);
      } else {
        setCurrentIndex((prev) => (prev - steps + images.length) % images.length);
      }
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const resetRotation = () => {
    setCurrentIndex(0);
    setIsAutoRotating(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">360° view not available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div
        ref={containerRef}
        className={`relative bg-white rounded-lg overflow-hidden ${
          isFullscreen ? 'w-full h-full flex items-center justify-center' : 'aspect-square'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <img
          src={images[currentIndex]}
          alt={`${productName} 360° view ${currentIndex + 1}`}
          className={`w-full h-full object-cover select-none ${
            isFullscreen ? 'max-h-screen max-w-screen object-contain' : ''
          }`}
          draggable={false}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={toggleAutoRotate}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            title={isAutoRotating ? 'Pause rotation' : 'Auto rotate'}
          >
            {isAutoRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button
            onClick={resetRotation}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            title="Reset rotation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
            Drag to rotate
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {!isFullscreen && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                index === currentIndex
                  ? 'border-indigo-600 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`View ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};