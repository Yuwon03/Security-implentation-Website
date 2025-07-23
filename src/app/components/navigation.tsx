import Link from "next/link";
import localFont from "next/font/local";

const myFont = localFont({ src: "../fonts/Raleway-VariableFont_wght.ttf" });

export const Navigation = () => {
    return (
        <nav className="flex justify-between items-center gap-10 bg-white text-black px-5">
            <Link href="/" className={`${myFont.className} text-black text-xl`}>
                Home
            </Link>
            <a href="https://www.ksgdw.com/eng/products/-/DARAE/1" target="_blank" rel="noopener noreferrer" className={`${myFont.className} text-black text-xl`}>
                Patterns
            </a>
            <Link href="/contact" className={`${myFont.className} text-black text-xl`}>
                Contact
            </Link>
            <a href="https://www.crayon-wallpaper.com/goods/goods_list.php?page=2&cateCd=001" target="_blank" rel="noopener noreferrer" className={`${myFont.className} text-black text-xl`}>
                Mural
            </a>
            {/* <Link href="/collection" className={`${myFont.className} text-black text-xl`}>
                Collection
            </Link> */}
        </nav>
    );
}