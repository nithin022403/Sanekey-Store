import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [zoom, setZoom] = useState(1);
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
    setZoom(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
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
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white">
          <img
            src={images[currentIndex]}
            alt={`${productName} 360° view ${currentIndex + 1}`}
            className="select-none transition-transform duration-300"
            style={{
              transform: `scale(${zoom})`,
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            draggable={false}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            disabled={zoom <= 1}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs text-center">
            {(zoom * 100).toFixed(0)}%
          </div>
        </div>

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
            title="Reset rotation and zoom"
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
            Drag to rotate • Scroll to zoom
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
                  ? 'border-blue-600 ring-2 ring-blue-200'
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