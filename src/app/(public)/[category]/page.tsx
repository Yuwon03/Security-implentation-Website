"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface ImageItem {
  id: string;
  name: string;
  mimeType?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const category = (params?.category ?? "") as string;

  const [images, setImages] = useState<ImageItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const loadedIdsRef = useRef<Set<string>>(new Set());
  const requestSeqRef = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchImages = useCallback(
    async (token?: string) => {
      if (!category || loadingRef.current) return;

      loadingRef.current = true;
      const seq = ++requestSeqRef.current;

      try {
        const res = await fetch(
          `/api/public-images/${encodeURIComponent(category)}${
            token ? `?pageToken=${encodeURIComponent(token)}` : ""
          }`,
          { cache: "no-store" } // server handles CDN caching
        );

        if (!res.ok) throw new Error(`List failed: ${res.status}`);
        const data: { images: ImageItem[]; nextPageToken: string | null } =
          await res.json();

        if (seq !== requestSeqRef.current) return;

        const fresh: ImageItem[] = [];
        for (const img of data.images) {
          if (!loadedIdsRef.current.has(img.id)) {
            loadedIdsRef.current.add(img.id);
            fresh.push(img);
          }
        }

        setImages((prev) => (token ? [...prev, ...fresh] : fresh));
        setNextPageToken(data.nextPageToken);
      } catch (e) {
        console.error(e);
      } finally {
        loadingRef.current = false;
      }
    },
    [category]
  );

  useEffect(() => {
    loadedIdsRef.current = new Set();
    setImages([]);
    setNextPageToken(null);
    requestSeqRef.current++; // invalidate in-flight
    loadingRef.current = false;
    fetchImages(undefined);
  }, [category, fetchImages]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loadingRef.current) {
          fetchImages(nextPageToken);
        }
      },
      { root: null, rootMargin: "1200px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextPageToken, fetchImages]);

  return (
    <main className="px-4 py-10">
      <h1 className="text-3xl font-bold text-center capitalize mb-8">
        {category}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, i) => {
          const previewSrc = `/api/image-proxy?id=${encodeURIComponent(
            img.id
          )}&w=2000`; // grid
          const fullSrc = `/api/image-proxy?id=${encodeURIComponent(img.id)}`; // modal

          return (
            <button
              key={img.id}
              className="relative aspect-[3/2] overflow-hidden rounded shadow focus:outline-none"
              onClick={() => setSelectedImage(fullSrc)}
            >
              <Image
                src={previewSrc}
                alt={img.name}
                fill
                className="object-cover transition-transform hover:scale-105"
                // Responsive sizes matching your grid:
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                // Preload a few above-the-fold items
                priority={i < 6}
              />
            </button>
          );
        })}
      </div>

      <div ref={observerRef} className="h-10" />

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-h-[90vh] max-w-[90vw] w-full h-full">
            <Image
              src={selectedImage}
              alt="Full"
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white text-3xl font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
