import Image from "next/image";

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
            fontWeight: "bold",
          }}
        >
          Supply & Installation
        </p>
      </div>

      <div className="text-center mt-10">
        <p className="tracking-wider text-3xl font-semibold">
          Open 7days / Biggest showroom
        </p>
        <p className="tracking-wider text-3xl mt-2 font-semibold">
          2,000+ patterns displayed
        </p>
        <p className="tracking-wider text-3xl mt-2 font-semibold">
          Pick free samples up Today
        </p>
      </div>

      <main className="grid grid-cols-2 gap-2 p-2 mt-20 bg-gray-100">
        {sections.map((section) => (
          <div key={section.id} className="mt-10 text-center">
            <p className="text-black text-2xl mb-4 font-semibold">
              {section.title}
            </p>
            <a href={section.href} className="relative group inline-block">
              <Image
                src={section.image}
                alt={section.alt}
                width={550}
                height={475}
                className="object-cover z-0"
              />
              <div
                className="absolute inset-0 z-10 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-2xl font-semibold">Discover</p>
              </div>
            </a>
          </div>
        ))}
      </main>
    </div>
  );
}
