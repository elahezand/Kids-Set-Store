const Listing = require("../../models/listing");

const findListingForDetail = (id) =>
  Listing.findById(id)
    .populate("categoryPath", "_id title slug")
    .lean();

const PROTECTED_FIELDS = ["status", "price", "metrics", "slug", "shortIdentifier"];

module.exports = {
  PROTECTED_FIELDS,
  buildListingDetail,
  findListingForDetail,
};

