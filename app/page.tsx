import ProductCard from "@/components/custom/ProductCard";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/featured`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-800">
          Freshly Baked with Love
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          The best homemade cookies, supervised by Teddy & Millie.
        </p>
        <button className="mt-8 bg-pink-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-pink-600">
          Shop Now
        </button>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          This Week&apos;s Featured Cookies
        </h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              basePrice={product.basePrice}
              imageUrl={product.imageUrl || ''}
              isFeatured={product.isFeatured}
            />
          ))}
        </div>
        
        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
          >
            View All Cookies
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
