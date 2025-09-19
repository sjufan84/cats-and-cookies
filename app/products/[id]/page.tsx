import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <p className="mt-4">Sorry, we couldn&apos;t find the product you&apos;re looking for.</p>
        <Link href="/" className="mt-4 inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-96 md:h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="bg-gray-200 h-full w-full rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>

          <div className="mt-4">
            <span className="text-3xl font-bold text-pink-500">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Description</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="bg-pink-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors">
              Add to Cart
            </button>
            <Link href="/" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors text-center">
              Continue Shopping
            </Link>
          </div>

          {product.isFeatured && (
            <div className="mt-6">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Featured Product
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
