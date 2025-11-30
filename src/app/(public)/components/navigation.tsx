import Link from "next/link";
import localFont from "next/font/local";

const myFont = localFont({ src: "../fonts/Raleway-VariableFont_wght.ttf" });

export const Navigation = () => (
  <nav className="fixed inset-x-0 top-0 z-50 bg-[#3f5345] text-black">
    <div className="mx-auto flex items-center justify-center gap-12 px-6 py-2">
      {[
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/tools", label: "Tools" },
        { href: "/installation", label: "Installation" },
        { href: "/patterns", label: "Patterns", external: true, extHref: "https://www.ksgdw.com/eng/products/-/DARAE/1" },
        { href: "/contact", label: "Contact" },
        { href: "/mural", label: "Mural", external: true, extHref: "https://www.kaleonwallpaper.com/?gad_source=1&gad_campaignid=22714828954&gbraid=0AAAAABwV1CZblxXkNKlScdtsIUyNHUaaH&gclid=CjwKCAjwt-_FBhBzEiwA7QEqyPNbu8-EUL5580dOTpTQFx8_8KsORLbL0iyhCLAlZEC4QxeVYFSWIhoCmnkQAvD_BwE" },
      ].map((link) =>
        link.external ? (
          <a key={link.label} href={link.extHref} target="_blank" rel="noopener" className={`${myFont.className} text-xl text-white`}>
            {link.label}
          </a>
        ) : (
          <Link key={link.label} href={link.href} className="text-xl text-white">
            {link.label}
          </Link>
        )
      )}
    </div>
  </nav>
)
