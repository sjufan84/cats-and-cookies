import ProductCard from "@/components/custom/ProductCard";

export default function Home() {
  // Dummy data for featured products
  const featuredProducts = [
    { id: 1, name: "Chocolate Chip Cookies", price: "$12.00", imageUrl: "" },
    { id: 2, name: "Oatmeal Raisin Cookies", price: "$10.00", imageUrl: "" },
    { id: 3, name: "Sugar Cookies", price: "$15.00", imageUrl: "" },
    { id: 4, name: "Peanut Butter Cookies", price: "$12.50", imageUrl: "" },
  ];

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
          This Week's Featured Cookies
        </h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
