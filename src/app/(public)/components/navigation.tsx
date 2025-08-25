import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";

const myFont = localFont({ src: "../fonts/Raleway-VariableFont_wght.ttf" });

export const Navigation = () => (
  <nav className="flex items-center justify-between bg-white px-6">
    {/* 1) Logo on the left */}
    <Link href="/">
      <Image
        src="/logo.png"
        alt="Wallpaper masters logo"
        width={64}
        height={78}
        priority
      />
    </Link>

    {/* 2) Your menu items */}
    <div className="ml-20 flex items-center space-x-8">
      {[
        { href: "/", label: "Home" },
        { href: "/patterns", label: "Patterns", external: true, extHref: "https://…" },
        { href: "/contact", label: "Contact" },
        { href: "/mural", label: "Mural", external: true, extHref: "https://…" },
      ].map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.extHref}
            target="_blank"
            rel="noopener"
            className={`${myFont.className} text-xl`}
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className={`${myFont.className} text-xl`}
          >
            {link.label}
          </Link>
        )
      )}
    </div>
  </nav>
);
