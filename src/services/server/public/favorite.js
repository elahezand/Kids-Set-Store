import Favorite from "@/model/favorite";
import Product from "@/model/product";

const getPopularProducts = async (query = {}) => {
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const popular = await Favorite.aggregate([
    {
      $group: {
        _id: "$productId",
        favoritesCount: { $sum: 1 },
      },
    },
    {
      $sort: {
        favoritesCount: -1,
      },
    },
    {
      $limit: limit,
    },
  ]);

  if (popular.length === 0) {
    return [];
  }

  const productIds = popular.map((entry) => entry._id);

  const products = await Product.find({
    _id: { $in: productIds },
    status: "active",
  })
    .select("title slug price minPrice images variants metrics shortIdentifier")
    .lean();

  const productMap = new Map(products.map((product) => [String(product._id), product]));

  return popular
    .map((entry) => {
      const product = productMap.get(String(entry._id));

      if (!product) {
        return null;
      }

      return {
        ...product,
        favoritesCount: entry.favoritesCount,
      };
    })
    .filter(Boolean);
};
const favoriteService = {
  getPopularProducts,
};

export default favoriteService;
