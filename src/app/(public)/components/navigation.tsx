import Link from "next/link";

export const Navigation = () => {
  return (
    <nav className="flex justify-start items-center gap-8 px-10 py-4 bg-white shadow-md text-black text-lg font-medium">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <a
        href="https://www.ksgdw.com/eng/products/-/DARAE/1"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Patterns
      </a>
      <Link href="/contact" className="hover:underline">
        Contact
      </Link>
      <a
        href="https://www.crayon-wallpaper.com/goods/goods_list.php?page=2&cateCd=001"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Mural
      </a>
    </nav>
  );
};
