export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Product Details</h1>
      <p className="mt-4">This is the page for product with ID: {params.id}.</p>
      <div className="mt-8">
        {/* Product image, description, price, and add to cart button will go here */}
        <div className="bg-gray-200 h-64 w-full rounded-lg"></div>
        <h2 className="text-2xl font-bold mt-4">Cookie Name</h2>
        <p className="text-lg mt-2">$3.50</p>
        <p className="mt-4">
          A delicious description of the cookie will be displayed here.
        </p>
        <button className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
          Add to Cart
        </button>
      </div>
    </main>
  );
}
