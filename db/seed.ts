import { db } from '../lib/db';
import { products } from '../db/schema';

async function seed() {
  console.log('Seeding database...');

  const sampleProducts = [
    {
      name: 'Chocolate Chip Cookies',
      description: 'Classic chocolate chip cookies made with premium chocolate chunks and a touch of vanilla. Baked to perfection with crispy edges and chewy centers.',
      basePrice: '2.00',
      imageUrl: '/images/chocolate-chip.jpg',
      isFeatured: true,
      isAvailable: true,
      category: 'cookies',
      ingredients: 'Flour, butter, sugar, chocolate chips, eggs, vanilla',
      allergens: 'Contains wheat, eggs, dairy',
      unitType: 'individual',
      minQuantity: 1,
      maxQuantity: 100,
    },
    {
      name: 'Oatmeal Raisin Cookies',
      description: 'Hearty oatmeal cookies packed with plump raisins and a hint of cinnamon. A wholesome treat that\'s perfect with morning coffee.',
      basePrice: '1.75',
      imageUrl: '/images/oatmeal-raisin.jpg',
      isFeatured: true,
      isAvailable: true,
      category: 'cookies',
      ingredients: 'Oats, flour, butter, sugar, raisins, cinnamon',
      allergens: 'Contains wheat, dairy',
      unitType: 'individual',
      minQuantity: 1,
      maxQuantity: 100,
    },
    {
      name: 'Sugar Cookies',
      description: 'Delicate sugar cookies decorated with colorful sprinkles. These buttery treats are perfect for celebrations or everyday sweet moments.',
      basePrice: '2.50',
      imageUrl: '/images/sugar-cookies.jpg',
      isFeatured: false,
      isAvailable: true,
      category: 'cookies',
      ingredients: 'Flour, butter, sugar, eggs, vanilla, sprinkles',
      allergens: 'Contains wheat, eggs, dairy',
      unitType: 'individual',
      minQuantity: 1,
      maxQuantity: 100,
    },
    {
      name: 'Peanut Butter Cookies',
      description: 'Rich peanut butter cookies with the classic crisscross pattern. Made with creamy peanut butter and a dash of sea salt.',
      basePrice: '2.25',
      imageUrl: '/images/peanut-butter.jpg',
      isFeatured: true,
      isAvailable: true,
      category: 'cookies',
      ingredients: 'Flour, butter, sugar, peanut butter, eggs, sea salt',
      allergens: 'Contains wheat, eggs, dairy, peanuts',
      unitType: 'individual',
      minQuantity: 1,
      maxQuantity: 100,
    },
    {
      name: 'Snickerdoodles',
      description: 'Soft and chewy snickerdoodles rolled in cinnamon sugar. These tangy cookies have a distinctive flavor that keeps you coming back for more.',
      basePrice: '1.85',
      imageUrl: '/images/snickerdoodles.jpg',
      isFeatured: false,
      isAvailable: true,
      category: 'cookies',
      ingredients: 'Flour, butter, sugar, cream of tartar, cinnamon',
      allergens: 'Contains wheat, dairy',
      unitType: 'individual',
      minQuantity: 1,
      maxQuantity: 100,
    },
    {
      name: 'Double Chocolate Brownies',
      description: 'Fudgy double chocolate brownies that are rich and decadent. Made with both cocoa powder and dark chocolate chips.',
      basePrice: '3.00',
      imageUrl: '/images/brownies.jpg',
      isFeatured: true,
      isAvailable: true,
      category: 'cookies',
      ingredients: 'Flour, butter, sugar, cocoa powder, dark chocolate chips, eggs',
      allergens: 'Contains wheat, eggs, dairy',
      unitType: 'individual',
      minQuantity: 1,
      maxQuantity: 100,
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