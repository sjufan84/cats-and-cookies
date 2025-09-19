export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center">Our Story</h1>
      <div className="mt-8 text-lg max-w-3xl mx-auto">
        <p>
          Welcome to Cats and Cookies! My name is Sage, and I'm the baker behind all the delicious treats you'll find here.
        </p>
        <p className="mt-4">
          I started this little bakery with my two best friends and official mascots, Teddy and Millie. They are my fluffy Maine Coon cats who are always by my side, especially when I'm baking. Teddy, the gentle gray giant, is our quality control expert (he loves the smells!). Millie, our playful orange girl, provides the creative inspiration.
        </p>
        <p className="mt-4">
          Baking has always been my passion, and I love sharing my creations with everyone. I hope you enjoy my cookies as much as I enjoy making them (and as much as Teddy and Millie enjoy supervising!).
        </p>
        <div className="flex justify-center mt-8 space-x-8">
            {/* Placeholder for cat images */}
            <div className="text-center">
                <div className="bg-gray-200 h-48 w-48 rounded-full mx-auto"></div>
                <p className="mt-2 font-bold">Teddy</p>
            </div>
            <div className="text-center">
                <div className="bg-gray-200 h-48 w-48 rounded-full mx-auto"></div>
                <p className="mt-2 font-bold">Millie</p>
            </div>
        </div>
      </div>
    </main>
  );
}
