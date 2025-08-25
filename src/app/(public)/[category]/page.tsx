// Updated frontend: /src/app/(public)/[category]/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

interface ImageItem {
  id: string;
  name: string;
  url: string; // full-size
  thumbnail: string;
}

export default function CategoryPage() {
  const { category } = useParams();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchImages = useCallback(async (token?: string) => {
    if (!category) return;
    setLoading(true);

    const res = await fetch(`/api/public-images/${category}?pageToken=${token || ""}`);
    const data = await res.json();

    setImages((prev) => [...prev, ...data.images]);
    setNextPageToken(data.nextPageToken);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    setImages([]); // reset when category changes
    fetchImages();
  }, [category, fetchImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loading) {
          fetchImages(nextPageToken);
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [nextPageToken, loading, fetchImages]);

  return (
    <main className="px-4 py-10">
      <h1 className="text-3xl font-bold text-center capitalize mb-8">
        {category}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <button
            key={`${img.id}-${index}`}
            className="aspect-[3/2] overflow-hidden rounded shadow focus:outline-none"
            onClick={() => setSelectedImage(`/api/image-proxy?id=${img.id}`)}
          >
            <img
              src={`/api/image-proxy?id=${img.id}`}
              alt={img.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {loading && <p className="text-center mt-6">Loading more...</p>}
      <div ref={observerRef} className="h-10" />

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <img
            src={selectedImage}
            alt="Full"
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-lg"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white text-3xl font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
