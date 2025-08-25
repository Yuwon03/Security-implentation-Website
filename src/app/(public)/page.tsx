import { CalendarDaysIcon, Squares2X2Icon, TruckIcon } from '@heroicons/react/24/outline'
import Image from "next/image";
import Link from "next/link";

const sections = [
  {
    id: 1,
    title: "Bedroom",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Bedroom",
    href: "/bedroom",
  },
  {
    id: 2,
    title: "Living Room",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Living Room",
    href: "/livingroom",
  },
  {
    id: 3,
    title: "Staircase",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Staircase",
    href: "/staircase",
  },
  {
    id: 4,
    title: "Hallway",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Hallway",
    href: "/hallway",
  },
  {
    id: 5,
    title: "TV Back",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "TV Back",
    href: "/tvback",
  },
  {
    id: 6,
    title: "Customised Mural",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Custom Wallpaper",
    href: "/custom",
  },
  {
    id: 7,
    title: "Office",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Office",
    href: "/office",
  },
  {
    id: 8,
    title: "Cinema Room",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Cinema Room",
    href: "/cinema",
  },
  {
    id: 9,
    title: "Niche",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Niche",
    href: "/niche",
  },
  {
    id: 10,
    title: "Fireplace",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Fireplace",
    href: "/fireplace",
  },
  {
    id: 11,
    title: "kidsroom",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Kids Room",
    href: "/kidsroom",
  },
  {
    id: 12,
    title: "Flooring",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Flooring",
    href: "/flooring",
  },
  {
    id: 13,
    title: "Prayer Room",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Prayer Room",
    href: "/prayerroom",
  },
  {
    id: 15,
    title: "Toilet",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Toilet",
    href: "/toilet",
  },
  {
    id: 16,
    title: "Dining Room",
    image: "/main_page/images/Bedroom_thumbnail.jpg",
    alt: "Dining Room",
    href: "/dining",
  },
];

export default function Home() {
  const features = [
    { name: 'Showroom open 7 days',       Icon: CalendarDaysIcon },
    { name: '2,000+ patterns displayed',  Icon: Squares2X2Icon },
    { name: 'Supply & Installation',      Icon: TruckIcon },
  ]
  return (
    <div>
      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <video
          src="/main_page/videos/wallpaper.mov"
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <p
          className="tracking-wider text-center"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "2rem",
            fontWeight: "MyCustomFont2",
          }}
        >
          Supply & Installation
        </p>
      </div>

      <div
        className="flex justify-center gap-12 mt-10"
        style={{ fontFamily: 'MyCustomFont' }}
      >
        {features.map(({ name, Icon }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className="bg-gray-200 p-3 rounded-full">
              <Icon className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-xl text-center">{name}</p>
          </div>
        ))}
      </div>

      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 mt-20 bg-gray-100">
        {sections.map((section) => (
          <div key={section.id} className="mt-10 text-center">
            <p className="text-black text-2xl mb-4 font-semibold">
              {section.title}
            </p>

            <Link href={section.href} className="block group">
              {/* 1) Aspect-ratio box (16:9) */}
              <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                {/* 2) fill + object-cover makes them all crop/scale to fit */}
                <Image
                  src={section.image}
                  alt={section.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* 3) Your existing overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-2xl font-semibold">Discover</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </main>
    </div>
  );
}
