export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} Cats & Cookies. All Rights Reserved.</p>
        <p className="text-sm mt-2">
          Made with love by Sage (and her cats, Teddy & Millie!)
        </p>
      </div>
    </footer>
  );
}
