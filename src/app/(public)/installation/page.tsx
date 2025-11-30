const coreValues = [
  "100% Imported from South Korea: All our wallpapers are directly imported from Korea, ensuring unmatched quality and cutting-edge design.",
  "Diverse Patterns and Textures: You must see and feel the difference! Each pattern possesses a unique texture, which can only be fully appreciated by visiting our showroom.",
];

const installationTools = [
  "Professional Installation Tools",
  "High-Quality Paste and Glue",
  "Primer",
  "Wallpaper Silicon",
];

const customerBenefits = [
  "Free Samples: Feel free to pick up complimentary samples of your choice when you visit our showroom.",
  "Free Quote Service: Once you select a pattern at our showroom, we will provide you with an accurate, no-obligation quote free of charge.",
];

const contacts = [
  {
    region: "NSW",
    person: "Bruce",
    phone: "0413 547 040",
    address: "Vinegar Hill Road, Kellyville Ridge NSW",
  },
  {
    region: "VIC",
    person: "Jason",
    phone: "0413 940 235",
    address: "93A Sayers Road, Williams Landing VIC",
  },
];

export default function InstallationPage() {
  return (
    <main className="px-4 py-12 space-y-10">
      <section className="mx-auto max-w-4xl space-y-3 text-center">
        <h1 className="text-4xl font-bold">Installation Service</h1>
        <p className="text-lg font-semibold text-green-800">
          🎨 Wallpaper Masters: Features &amp; Services
        </p>
        <p className="text-gray-800">
          Transform your space with Wallpaper Masters! We proudly provide top-quality wallpaper supply
          and installation services across NSW and VIC in Australia.
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Our Core Value Proposition</h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-800">
          {coreValues.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-4xl space-y-3 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Everything for a Perfect Installation</h2>
        <p>We sell all the necessary tools and supplies for a flawless wallpaper installation.</p>
        <ul className="list-disc space-y-2 pl-5 text-gray-800">
          {installationTools.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-4xl space-y-3 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Exclusive Customer Benefits</h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-800">
          {customerBenefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Showrooms &amp; Contact</h2>
        <p>Please feel free to contact us or visit one of our showrooms!</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Region</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Contact Person</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Phone Number</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Showroom Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.region}>
                  <td className="px-4 py-3">{contact.region}</td>
                  <td className="px-4 py-3">{contact.person}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-blue-700 underline">
                      {contact.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">{contact.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-semibold">www.wallpapermasters.com.au</p>
      </section>
    </main>
  );
}
