import { db } from '../lib/db';
import { products } from '../db/schema';

async function seed() {
  console.log('Seeding database...');

  const sampleProducts = [
    {
      name: 'Chocolate Chip Cookies',
      description: 'Classic chocolate chip cookies made with premium chocolate chunks and a touch of vanilla. Baked to perfection with crispy edges and chewy centers.',
      price: '12.00',
      imageUrl: '/images/chocolate-chip.jpg',
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Oatmeal Raisin Cookies',
      description: 'Hearty oatmeal cookies packed with plump raisins and a hint of cinnamon. A wholesome treat that\'s perfect with morning coffee.',
      price: '10.00',
      imageUrl: '/images/oatmeal-raisin.jpg',
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Sugar Cookies',
      description: 'Delicate sugar cookies decorated with colorful sprinkles. These buttery treats are perfect for celebrations or everyday sweet moments.',
      price: '15.00',
      imageUrl: '/images/sugar-cookies.jpg',
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Peanut Butter Cookies',
      description: 'Rich peanut butter cookies with the classic crisscross pattern. Made with creamy peanut butter and a dash of sea salt.',
      price: '12.50',
      imageUrl: '/images/peanut-butter.jpg',
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Snickerdoodles',
      description: 'Soft and chewy snickerdoodles rolled in cinnamon sugar. These tangy cookies have a distinctive flavor that keeps you coming back for more.',
      price: '11.00',
      imageUrl: '/images/snickerdoodles.jpg',
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Double Chocolate Brownies',
      description: 'Fudgy double chocolate brownies that are rich and decadent. Made with both cocoa powder and dark chocolate chips.',
      price: '18.00',
      imageUrl: '/images/brownies.jpg',
      isFeatured: true,
      isAvailable: true,
    },
  ];

  try {
    await db.insert(products).values(sampleProducts);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();