import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-pink-500">
          Cats & Cookies
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-pink-500">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-pink-500">
            Our Story
          </Link>
          <Link href="/#featured" className="text-gray-600 hover:text-pink-500">
            Cookies
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-pink-500" />
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Link>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-pink-500">
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
