import Image from "next/image";

const priceList = [
  "Paste - $20 per Pack / 200g / 3L / 16sqm",
  "Paste - $40 per Pack / 500g / 8L / 33sqm",
  "Silicon for wallpaper - $20 each",
  "Primer, Binder - $20 per 500ml",
  "Cutting guider - $5 each",
];

const steps = [
  "Mix: Slowly add 200g of powder to 3 litres of clean water while stirring continuously until thoroughly mixed.",
  "Wait: Allow the mixture to sit for 15 minutes to fully activate and thicken.",
  "Apply: Use the paste within 24 hours. Apply directly to the wall surface or the back of the wallpaper. Ensure the entire back surface is evenly coated.",
  "Install: Smooth the wallpaper onto the wall as per standard installation procedures.",
];

export default function ToolsPage() {
  return (
    <main className="px-4 py-12 space-y-10">
      <section className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-green-800">
            Wallpaper Glue | Paste | Adhesive
          </p>
          <h1 className="text-4xl font-bold">Wallpaper Installation Tools</h1>
          <p className="text-gray-800">
            We stock the essentials so you can hang wallpaper with confidence:
            premium natural wallpaper paste (glue/adhesive), wallpaper silicon,
            primer/binder, and cutting guiders. All products are chosen to work
            with our wallpapers for strong adhesion and a clean finish.
          </p>
          <p className="text-lg font-semibold text-green-800">
            🌿 The healthiest way to hang your wallpaper
          </p>
          <p className="text-gray-800">
            Our Premium Natural Wallpaper Paste is made in South Korea from
            100% natural ingredients—heavy-duty adhesion without harmful
            chemicals. A single pack covers up to 16 sqm, perfect for heavy-duty
            and vinyl wall coverings.
          </p>
        </div>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
          <Image
            src="/tools/wallpaper%20tools.jpg"
            alt="Wallpaper glue, brush, and tools"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-4 rounded-lg bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">What we sell (in store)</h2>
          <p className="text-gray-800">
            Grab the right materials fast—our staff will guide you on quantities for your job.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Natural Wallpaper Paste", note: "Glue / adhesive (powdered), made in Korea" },
            { title: "Wallpaper Silicon", note: "Seal edges and seams cleanly" },
            { title: "Primer / Binder", note: "Boost adhesion on tricky surfaces" },
            { title: "Cutting Guider", note: "Straighter cuts, cleaner installs" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-emerald-200 bg-white p-4 shadow-[0_6px_18px_-10px_rgba(16,185,129,0.6)]"
            >
              <p className="text-lg font-semibold text-emerald-800">{item.title}</p>
              <p className="text-sm text-gray-700">{item.note}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white/80 px-4 py-3 text-sm text-gray-800 shadow-inner">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Quick tip
          </span>
          <span>
            Bring your wall sizes or photos. We will match the right adhesive, silicon, and primer to your surface,
            or book an installer for you.
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">How to use wallpaper paste</h2>
        <p>Using Wallpaper Masters Paste is simple and effective.</p>
        <ol className="list-decimal space-y-2 pl-6 text-gray-800">
          {steps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-4xl space-y-3 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Price</h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-800">
          {priceList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-4xl space-y-3 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Need Installation Support?</h2>
        <p>If you have any questions during your wallpaper installation process, we are here to help!</p>
        <p className="font-semibold">Contact: Bruce at the Wallpaper Masters Sydney Shop. 0413547040</p>
        <p>Shop. 1 Vinegar Hill Road Kellyville Ridge NSW 2155</p>
        <p>Website. www.wallpapermasters.com.au</p>
      </section>
    </main>
  );
}
