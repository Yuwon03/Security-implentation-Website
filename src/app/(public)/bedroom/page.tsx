"use client";
import { useEffect, useState } from "react";

interface DriveImage {
  id: string;
  name: string;
  url: string;
}

export default function BedroomGallery() {
  const [images, setImages] = useState<DriveImage[]>([]);

  useEffect(() => {
    fetch("/api/public-images")
      .then((res) => res.json())
      .then(setImages)
      .catch((err) => console.error("Error fetching images:", err));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {images.map((img) => (
        <img
          key={img.id}
          src={img.url}
          alt={img.name}
          className="w-full h-auto object-cover rounded shadow"
        />
      ))}
    </div>
  );
}
