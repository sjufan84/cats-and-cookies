export default function CartPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
      <div className="mt-8">
        {/* Cart items will be listed here */}
        <p>Your cart is currently empty.</p>
        {/* Example of a cart item */}
        <div className="flex justify-between items-center mt-4 border-t pt-4">
          <div>
            <h2 className="text-xl font-bold">Chocolate Chip Cookie</h2>
            <p className="text-sm">Quantity: 2</p>
          </div>
          <p className="text-lg font-bold">$7.00</p>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}
