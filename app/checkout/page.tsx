export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold">Shipping Information</h2>
          {/* Form for shipping details will go here */}
          <form className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input type="text" id="name" className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input type="email" id="email" className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
            </div>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Payment</h2>
          {/* Stripe payment element will be embedded here */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p>Stripe payment form will be here.</p>
          </div>
          <button className="mt-4 w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600">
            Pay Now
          </button>
        </div>
      </div>
    </main>
  );
}
