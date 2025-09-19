export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">
        Welcome, Sage! This is your dashboard to manage products and view orders.
      </p>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        {/* A table or list of products with edit/delete buttons will go here */}
        <p className="mt-4">Product management features will be here.</p>
         <button className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
          Add New Product
        </button>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Recent Orders</h2>
        {/* A list of recent orders will be displayed here */}
        <p className="mt-4">Recent orders will be listed here.</p>
      </div>
    </main>
  );
}
