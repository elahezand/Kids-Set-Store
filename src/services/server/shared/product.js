import Product from "@/model/product";
const findProductForDetail = (id) => Product.findById(id).populate("categoryPath", "_id title slug").lean();

const PROTECTED_FIELDS = ["status", "price", "metrics", "slug", "shortIdentifier"];

export { PROTECTED_FIELDS, findProductForDetail };

export default { PROTECTED_FIELDS, findProductForDetail };
