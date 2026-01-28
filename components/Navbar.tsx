import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent">
      <Link
        href="/"
        className="text-2xl md:text-3xl font-bold tracking-tighter text-red-600 uppercase"
      >
        MovieVerse
      </Link>
    </nav>
  );
}
