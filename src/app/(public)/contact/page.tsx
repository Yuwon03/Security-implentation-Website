export default function ContactPage() {
  return (
    <main className="px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Contact</h1>
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <p>
          For enquiries, quotes, or support, please reach out via email.
        </p>
        <p>
          <a
            href="mailto:wallpapermaster1@gmail.com"
            className="text-blue-600 underline"
          >
            wallpapermaster1@gmail.com
          </a>
        </p>

        <div className="space-y-8 text-left">
          <section className="rounded border p-6">
            <h2 className="text-2xl font-semibold mb-2">Melbourne</h2>
            <p className="mb-1"><span className="font-medium">Name:</span> Jason Jang</p>
            <p className="mb-1">
              <span className="font-medium">Location:</span>{" "}
              <a
                href="https://www.google.com/maps/place/93A+Sayers+Rd,+Williams+Landing+VIC+3027/@-37.8542678,144.7410905,17z/data=!3m1!4b1!4m6!3m5!1s0x6ad689a0d4eca0e5:0x6b84aa8b800f273c!8m2!3d-37.8542721!4d144.7436708!16s%2Fg%2F11c43z5jfp?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener"
                className="text-blue-600 underline"
              >
                Open in Google Maps
              </a>
            </p>
            <p>
              <span className="font-medium">Contact:</span>{" "}
              <a href="tel:041-394-0235" className="text-blue-600 underline">(041-394-0235)</a>
            </p>
          </section>

          <section className="rounded border p-6">
            <h2 className="text-2xl font-semibold mb-2">Sydney</h2>
            <p className="mb-1"><span className="font-medium">Name:</span> Bruce Choi</p>
            <p className="mb-1">
              <span className="font-medium">Location:</span>{" "}
              <a
                href="https://www.google.com/maps/place/Wallpaper+Masters+-+Kellyville+Showroom/@-33.7013764,150.9218134,17z/data=!3m1!4b1!4m6!3m5!1s0x6b12a3f22bd4c7bf:0x86a4c8e60a0ba2b1!8m2!3d-33.7013809!4d150.9243937!16s%2Fg%2F11h21klwqz?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener"
                className="text-blue-600 underline"
              >
                Open in Google Maps
              </a>
            </p>
            <p>
              <span className="font-medium">Contact:</span>{" "}
              <a href="tel:041-354-7040" className="text-blue-600 underline">(041-354-7040)</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}


