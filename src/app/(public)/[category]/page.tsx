"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

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

  // Refs for robustness against double-invocations and races in dev
  const loadingRef = useRef(false);
  const loadedIdsRef = useRef<Set<string>>(new Set());
  const requestSeqRef = useRef(0); // ignore late responses
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchImages = useCallback(
    async (token?: string) => {
      if (!category || loadingRef.current) return;

      loadingRef.current = true;
      const seq = ++requestSeqRef.current;

      try {
        const res = await fetch(
          `/api/public-images/${encodeURIComponent(category)}${token ? `?pageToken=${encodeURIComponent(token)}` : ""}`,
          { cache: "no-store" } // always go through our API; server will handle CDN caching
        );

        if (!res.ok) throw new Error(`List failed: ${res.status}`);
        const data: { images: ImageItem[]; nextPageToken: string | null } = await res.json();

        // Ignore stale responses (in case Strict Mode double-fired)
        if (seq !== requestSeqRef.current) return;

        // De-duplicate by ID
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

  // Reset when category changes
  useEffect(() => {
    loadedIdsRef.current = new Set();
    setImages([]);
    setNextPageToken(null);
    requestSeqRef.current++; // invalidate any in-flight from previous category
    loadingRef.current = false;
    // First page
    fetchImages(undefined);
  }, [category, fetchImages]);

  // Infinite scroll observer
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loadingRef.current) {
          fetchImages(nextPageToken);
        }
      },
      {
        // Start loading before we hit the very bottom (helps with large grids)
        root: null,
        rootMargin: "1200px 0px",
        threshold: 0,
      }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextPageToken, fetchImages]);

  return (
    <main className="px-4 py-10">
      <h1 className="text-3xl font-bold text-center capitalize mb-8">{category}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img) => {
          const src = `/api/image-proxy?id=${encodeURIComponent(img.id)}`;
          return (
            <button
              key={img.id}
              className="aspect-[3/2] overflow-hidden rounded shadow focus:outline-none"
              onClick={() => setSelectedImage(src)}
            >
              <img
                src={src}
                alt={img.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                loading="lazy"
                // If you add resizing in the proxy later, you can use src+`&w=800` for crisper thumbs
              />
            </button>
          );
        })}
      </div>

      <div ref={observerRef} className="h-10" />

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <img
            src={selectedImage}
            alt="Full"
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-lg"
          />
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
