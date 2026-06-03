import { Card } from "../models/Card.js";
import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { DateRecord } from "../models/DateRecord.js";
import { buildUniqueCardSlug } from "./cards.js";

// Stable, verified Unsplash photo IDs (women's fashion).
const img = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const PRODUCTS = [
  {
    title: "Aria Satin Slip Dress",
    price: 89,
    category: "Dresses",
    cardType: "signature",
    description:
      "A bias-cut satin slip with a fluid drape and delicate adjustable straps. The hero piece of the season — dress it up with heels or down with a knit.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#1c1c1c", "#b8a99a", "#7d2230"],
    tags: ["signature", "evening", "satin"],
    featured: true,
    isNewDrop: true,
    rating: 4.9,
    sortPriority: 100,
    images: [img("1515372039744-b8f02a3ae446"), img("1539109136881-3be0616acf4b")]
  },
  {
    title: "Noir Tailored Midi Dress",
    price: 119,
    category: "Dresses",
    cardType: "editorial",
    description:
      "Structured midi with a clean neckline and a defined waist. Quiet-luxury tailoring that moves from the office to dinner without a beat.",
    sizes: ["S", "M", "L"],
    colors: ["#111111", "#2e2a26"],
    tags: ["tailored", "midi", "evening"],
    featured: true,
    isNewDrop: false,
    rating: 4.8,
    sortPriority: 80,
    images: [img("1490481651871-ab68de25d43d")]
  },
  {
    title: "Bias-Cut Column Dress",
    price: 139,
    category: "Dresses",
    cardType: "editorial",
    description:
      "Floor-skimming column dress cut on the bias for an elongating line. Liquid drape, minimal seams, maximum impact.",
    sizes: ["S", "M", "L"],
    colors: ["#3b3b3b", "#9c8e7e"],
    tags: ["maxi", "occasion", "new"],
    featured: false,
    isNewDrop: true,
    rating: 4.7,
    sortPriority: 60,
    images: [img("1469334031218-e382a71b716b")]
  },
  {
    title: "Silk Camisole Top",
    price: 49,
    category: "Tops",
    cardType: "standard",
    description:
      "Pure-feel silk camisole with a bias front and fine straps. The layering staple that quietly elevates everything.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#efe7dd", "#1c1c1c", "#c4a3a3"],
    tags: ["silk", "layering", "essential"],
    featured: false,
    isNewDrop: true,
    rating: 4.8,
    sortPriority: 50,
    images: [img("1496747611176-843222e1e57c")]
  },
  {
    title: "Structured Poplin Shirt",
    price: 65,
    category: "Tops",
    cardType: "standard",
    description:
      "Crisp cotton poplin with a relaxed-but-sharp silhouette and mother-of-pearl buttons. An everyday workhorse with polish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#ffffff", "#dfe3e8"],
    tags: ["cotton", "workwear", "essential"],
    featured: true,
    isNewDrop: false,
    rating: 4.6,
    sortPriority: 55,
    images: [img("1487222477894-8943e31ef7b2")]
  },
  {
    title: "Ribbed Mock-Neck Top",
    price: 39,
    category: "Tops",
    cardType: "standard",
    description:
      "Second-skin ribbed knit with a clean mock neck. Stretches and recovers beautifully — pure capsule energy.",
    sizes: ["S", "M", "L"],
    colors: ["#1c1c1c", "#6b7280", "#efe7dd"],
    tags: ["knit", "basic", "capsule"],
    featured: false,
    isNewDrop: false,
    rating: 4.5,
    sortPriority: 30,
    images: [img("1571945153237-4929e783af4a")]
  },
  {
    title: "Linen Two-Piece Set",
    price: 129,
    category: "Sets",
    cardType: "editorial",
    description:
      "Breathable European linen set — a boxy short-sleeve top with wide tailored trousers. Effortless coordination, head to toe.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#d9cbb8", "#efe7dd"],
    tags: ["linen", "coord", "summer"],
    featured: true,
    isNewDrop: true,
    rating: 4.9,
    sortPriority: 90,
    images: [img("1483985988355-763728e1935b"), img("1485968579580-b6d095142e6e")]
  },
  {
    title: "Knit Lounge Set",
    price: 99,
    category: "Sets",
    cardType: "standard",
    description:
      "Soft-touch ribbed knit set that looks considered but feels like loungewear. The new way to do off-duty.",
    sizes: ["S", "M", "L"],
    colors: ["#b8a99a", "#1c1c1c"],
    tags: ["knit", "coord", "loungewear"],
    featured: false,
    isNewDrop: false,
    rating: 4.7,
    sortPriority: 40,
    images: [img("1525507119028-ed4c629a60a3")]
  },
  {
    title: "Tailored Wool Blazer",
    price: 159,
    category: "Outerwear",
    cardType: "signature",
    description:
      "A sharp single-breasted blazer in a wool blend with structured shoulders and a nipped waist. Throw it over anything to instantly look pulled together.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#1c1c1c", "#2e2a26", "#5c5048"],
    tags: ["tailoring", "wool", "signature"],
    featured: true,
    isNewDrop: false,
    rating: 4.9,
    sortPriority: 85,
    images: [img("1518049362265-d5b2a6467637")]
  },
  {
    title: "Oversized Trench Coat",
    price: 189,
    category: "Outerwear",
    cardType: "editorial",
    description:
      "A modern take on the trench — longline, double-breasted, with a tie waist and storm flap. The forever coat.",
    sizes: ["S", "M", "L"],
    colors: ["#c4b79f", "#3b3b3b"],
    tags: ["trench", "transitional", "new"],
    featured: false,
    isNewDrop: true,
    rating: 4.8,
    sortPriority: 70,
    images: [img("1487412720507-e7ab37603c6f")]
  },
  {
    title: "Cropped Leather Jacket",
    price: 175,
    category: "Outerwear",
    cardType: "standard",
    description:
      "A cropped moto cut in buttery vegan leather with antique hardware. Edge with a clean, feminine finish.",
    sizes: ["S", "M", "L"],
    colors: ["#1c1c1c", "#4a2c2a"],
    tags: ["leather", "moto", "statement"],
    featured: false,
    isNewDrop: false,
    rating: 4.6,
    sortPriority: 35,
    images: [img("1434389677669-e08b4cac3105")]
  },
  {
    title: "Cashmere-Blend Sweater",
    price: 95,
    category: "Knitwear",
    cardType: "standard",
    description:
      "Lofty cashmere-blend knit with a relaxed drop shoulder. The kind of soft you reach for every cold morning.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#efe7dd", "#b8a99a", "#7d2230"],
    tags: ["cashmere", "cozy", "essential"],
    featured: true,
    isNewDrop: false,
    rating: 4.9,
    sortPriority: 65,
    images: [img("1591047139829-d91aecb6caea")]
  },
  {
    title: "Fine-Gauge Cardigan",
    price: 79,
    category: "Knitwear",
    cardType: "standard",
    description:
      "A slim, button-through cardigan in fine-gauge knit. Wear it open as a layer or closed as a top.",
    sizes: ["S", "M", "L"],
    colors: ["#1c1c1c", "#d9cbb8"],
    tags: ["knit", "layering", "versatile"],
    featured: false,
    isNewDrop: false,
    rating: 4.5,
    sortPriority: 25,
    images: [img("1595777457583-95e059d581b8")]
  },
  {
    title: "High-Waist Tailored Trousers",
    price: 79,
    category: "Bottoms",
    cardType: "standard",
    description:
      "Fluid high-waist trousers with a pressed crease and a wide leg. Elongating, elegant, endlessly wearable.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#1c1c1c", "#3b3b3b", "#c4b79f"],
    tags: ["tailored", "wide-leg", "new"],
    featured: false,
    isNewDrop: true,
    rating: 4.8,
    sortPriority: 45,
    images: [img("1502716119720-b23a93e5fe1b")]
  },
  {
    title: "Pleated Midi Skirt",
    price: 69,
    category: "Bottoms",
    cardType: "standard",
    description:
      "A fluid pleated midi that catches the light and moves with you. Pairs with knits, shirts, or a simple tee.",
    sizes: ["S", "M", "L"],
    colors: ["#2e2a26", "#7d2230", "#b8a99a"],
    tags: ["pleated", "midi", "feminine"],
    featured: false,
    isNewDrop: false,
    rating: 4.7,
    sortPriority: 28,
    images: [img("1612336307429-8a898d10e223")]
  },
  {
    title: "Wide-Leg Denim",
    price: 89,
    category: "Bottoms",
    cardType: "standard",
    description:
      "Rigid wide-leg denim with a high rise and a clean full-length hem. A modern, polished take on everyday denim.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#3b4a5a", "#1c1c1c"],
    tags: ["denim", "wide-leg", "everyday"],
    featured: false,
    isNewDrop: false,
    rating: 4.6,
    sortPriority: 32,
    images: [img("1554568218-0f1715e72254")]
  }
];

const REVIEW_POOL = [
  { author: "Madina K.", rating: 5, comment: "The fabric feels so much more expensive than the price. Fits true to size and the drape is gorgeous." },
  { author: "Sevara A.", rating: 5, comment: "Obsessed. Wore it twice already and got compliments both times. Shipping was fast too." },
  { author: "Dilnoza R.", rating: 4, comment: "Beautiful piece, color is exactly like the photos. Took off one star only because I wanted it a touch longer." },
  { author: "Kamila T.", rating: 5, comment: "This is my third order from FIERO and the quality is always consistent. Highly recommend." },
  { author: "Nigora S.", rating: 5, comment: "Perfect for both work and evenings. The tailoring is really flattering." },
  { author: "Aziza M.", rating: 4, comment: "Lovely quality and soft on the skin. Sizing runs slightly large, size down if you're between sizes." }
];

const ORDER_CUSTOMERS = [
  { customerName: "Gulnoza Yusupova", phone: "+998 90 123 45 67", address: "Tashkent, Yunusabad district, Amir Temur ave 12, apt 34", status: "new" },
  { customerName: "Shahnoza Karimova", phone: "+998 93 555 21 09", address: "Tashkent, Chilonzor district, Bunyodkor ave 45", status: "confirmed" },
  { customerName: "Malika Tursunova", phone: "+998 97 700 88 11", address: "Samarkand, Registon street 8", status: "shipped" },
  { customerName: "Feruza Abdullayeva", phone: "+998 94 332 22 18", address: "Tashkent, Mirzo Ulugbek district, Buyuk Ipak Yuli 102", status: "delivered" },
  { customerName: "Zarina Olimova", phone: "+998 91 444 67 23", address: "Bukhara, Mustaqillik street 19, apt 7", status: "delivered" }
];

/**
 * Seed the storefront with demo products, reviews and orders.
 * @param {{ force?: boolean }} options - force=true wipes existing demo data first.
 */
export async function seedStoreData({ force = false } = {}) {
  const existing = await Card.countDocuments();

  if (existing > 0 && !force) {
    return { skipped: true, reason: "products-already-exist", products: existing };
  }

  if (force) {
    await Promise.all([
      Card.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      DateRecord.deleteMany({ entityType: "card" })
    ]);
  }

  // Insert products one-by-one so slugs are generated uniquely.
  const createdCards = [];
  for (const product of PRODUCTS) {
    const card = await Card.create({
      ...product,
      slug: await buildUniqueCardSlug(product.title)
    });
    createdCards.push(card);
  }

  // Attach 1-2 reviews to roughly two-thirds of the catalog.
  const reviews = [];
  createdCards.forEach((card, index) => {
    if (index % 3 === 2) return; // leave some products review-free for realism
    const count = (index % 2) + 1;
    for (let i = 0; i < count; i += 1) {
      const template = REVIEW_POOL[(index + i) % REVIEW_POOL.length];
      reviews.push({
        cardId: card._id,
        rating: template.rating,
        comment: template.comment,
        author: template.author
      });
    }
  });
  if (reviews.length) {
    await Review.insertMany(reviews);
  }

  // Build a handful of realistic orders referencing actual products.
  const pick = (i) => createdCards[i % createdCards.length];
  const lineFrom = (card, size, color, quantity) => ({
    productId: card.id,
    title: card.title,
    image: card.images[0] ?? "",
    price: card.price,
    size,
    color,
    quantity
  });

  const orders = ORDER_CUSTOMERS.map((customer, index) => {
    const items = [
      lineFrom(pick(index), "M", pick(index).colors[0], 1),
      lineFrom(pick(index + 3), "S", pick(index + 3).colors[0], index === 0 ? 2 : 1)
    ];
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      customerName: customer.customerName,
      phone: customer.phone,
      address: customer.address,
      items,
      totalPrice,
      status: customer.status
    };
  });

  await Order.insertMany(orders);

  return {
    skipped: false,
    products: createdCards.length,
    reviews: reviews.length,
    orders: orders.length
  };
}
