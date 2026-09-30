const Product = require("@/model/product");

const findProductForDetail = (id) =>
  Product.findById(id)
    .populate("categoryPath", "_id title slug")
    .lean();

const PROTECTED_FIELDS = ["status", "price", "metrics", "slug", "shortIdentifier"];

module.exports = {
  PROTECTED_FIELDS,
  findProductForDetail,
};

