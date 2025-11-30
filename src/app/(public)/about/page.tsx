import Link from "next/link";

const sectors = [
  "Residential Homes",
  "Commercial Properties",
  "Office Spaces",
  "Restaurants & Cafés",
  "Hotels & Hospitality",
  "...and more!",
];

export default function AboutPage() {
  return (
    <main className="px-4 py-12 space-y-12">
      <section className="mx-auto max-w-4xl text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-green-800">
          Sydney Wallpaper Supply & Installation
        </p>
        <h1 className="text-4xl font-bold">
          Wallpaper Masters: Your Premier Source for Supply & Installation
        </h1>
        <p className="text-lg text-gray-800">
          Come and check pattern and texture from our showroom.
        </p>
        <p className="text-lg font-semibold text-gray-900">
          Call now <a href="tel:0413547040" className="text-blue-700 underline">0413547040</a>
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-2xl font-semibold">Why Visit Our Showroom</h2>
          <p>
            The Sydney Wallpaper Supply & Installation Kellyville Showroom features thousands
            of patterns on display. It is the only shop in Sydney where you can view over 500
            different wallpapers as local stock in the showroom, so you can purchase immediately
            or receive a free sample on the spot.
          </p>
          <p>
            Wallpaper Masters is the only wallpaper retailer in Sydney that provides sales,
            installation, and free maintenance all processed by the same company. We offer a
            2-year guarantee covering any issues with the wallpaper or the installation
            process, providing free maintenance for the entire duration.
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-2xl font-semibold">Serving All Sectors</h2>
          <p>We cater to a diverse range of projects, ensuring the ideal aesthetic and quality for your needs:</p>
          <ul className="list-disc space-y-1 pl-5 text-gray-800">
            {sectors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-3 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Find Your Perfect Style</h2>
        <p>
          Whether you seek the latest fashion trends, a timeless classic style, or a unique look for
          a special event, Wallpaper Master has your solution.
        </p>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Visit Our Showroom</h2>
          <p>Experience our collections firsthand and receive personalized service.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border p-4">
            <p className="font-semibold">Open Showroom (Mon - Fri)</p>
            <p>Regular Business Hours</p>
          </div>
          <div className="rounded border p-4">
            <p className="font-semibold">Weekend Showroom (Sat - Sun 10a.m - 5p.m)</p>
            <p>Notes: Booking is required for Saturday & Sunday visits.</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Booking is also noted as &quot;No required&quot; for Saturday & Sunday visits in the source content.
          Please confirm your preferred approach when scheduling.
        </p>
      </section>

      <section className="mx-auto max-w-4xl text-center">
        <Link
          href="/contact"
          className="inline-block rounded bg-[#3f5345] px-5 py-3 text-white transition hover:brightness-110"
        >
          Contact our team
        </Link>
      </section>
    </main>
  );
}
