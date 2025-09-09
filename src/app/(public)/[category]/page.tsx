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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          setError(
            `Failed to load images (status ${res.status}). ${errText || ""}`.trim()
          );
          return;
        }
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

      {error && (
        <div className="mx-auto max-w-2xl mb-8 rounded border border-red-300 bg-red-50 p-4 text-red-700 text-center">
          {error}
        </div>
      )}

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
              onClick={() => setSelectedIndex(i)}
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

      {selectedIndex !== null && images[selectedIndex] && (
        <Lightbox
          images={images}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onChangeIndex={(idx) => setSelectedIndex(idx)}
        />)
      }
    </main>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onChangeIndex,
}: {
  images: ImageItem[];
  index: number;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}) {
  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef<number>(0);

  const numImages = images.length;
  const clampIndex = (i: number) => (i + numImages) % numImages;

  const goPrev = useCallback(() => onChangeIndex(clampIndex(index - 1)), [index, numImages, onChangeIndex]);
  const goNext = useCallback(() => onChangeIndex(clampIndex(index + 1)), [index, numImages, onChangeIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext, onClose]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    deltaXRef.current = e.touches[0].clientX - startXRef.current;
  };
  const handleTouchEnd = () => {
    const threshold = 50; // px
    if (deltaXRef.current > threshold) {
      goPrev();
    } else if (deltaXRef.current < -threshold) {
      goNext();
    }
    startXRef.current = null;
    deltaXRef.current = 0;
  };

  const current = images[index];
  const fullSrc = `/api/image-proxy?id=${encodeURIComponent(current.id)}`;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="absolute top-6 right-6 text-white text-3xl font-bold"
        aria-label="Close"
        onClick={onClose}
      >
        ✕
      </button>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl px-3 py-2 bg-black/40 rounded"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        aria-label="Previous image"
      >
        ‹
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={fullSrc}
          alt={current.name}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl px-3 py-2 bg-black/40 rounded"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        aria-label="Next image"
      >
        ›
      </button>
    </div>
  );
}
