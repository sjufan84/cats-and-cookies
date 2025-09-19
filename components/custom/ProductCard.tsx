import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
}

export default function ProductCard({ id, name, price, imageUrl }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`}>
      <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-64">
            {/* Using a placeholder div for now, but this will be an Image component */}
            <div className="bg-gray-200 h-full w-full"></div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="mt-2 text-pink-500 font-semibold">{price}</p>
          <button className="mt-4 w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
