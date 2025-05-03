import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <Link href="/">
          <h1 className="text-xl font-bold text-blue-700">24TexMarket</h1>
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/listings" className="text-gray-800 hover:text-blue-600">E’lonlar</Link>
          <Link href="/add-listing" className="text-gray-800 hover:text-blue-600">+ Qo‘shish</Link>
          <Link href="/profile" className="text-gray-800 hover:text-blue-600">Profil</Link>
          <Link href="/login" className="text-gray-800 hover:text-blue-600">Kirish</Link>
          <Link href="/register" className="text-gray-800 hover:text-blue-600">Ro‘yxatdan o‘tish</Link>
        </div>
      </div>
    </nav>
  );
}
