import Listing from "@/model/listing";
import { paginate, buildListingFilters } from "@/utils/paginate";
import invalidateCache from "@/utils/cache";
import { PROTECTED_FIELDS } from "@/services/shared/listing";
import { isValidObjectId } from "mongoose";

const EDITABLE_PRODUCT_STATUSES = [
    "draft",
    "active",
    "inactive",
];

const uploadedPaths = (files = []) =>
    files.map((f) => `/listings/images/${f.filename}`);

const pickProductStatus = (status) =>
    EDITABLE_PRODUCT_STATUSES.includes(status)
        ? status
        : undefined;

const getAllListingsAdmin = async (query = {}) => {
    const filters = await buildListingFilters(query, {
        isAdmin: true,
    });

    const limit = Math.min(
        query.limit ? Number(query.limit) : 21,
        99
    );

    return paginate(Listing, {
        limit,
        cursor: query.cursor,
        filters,
        populate: ["categoryPath", "owner"],
        sort: {
            _id: -1,
        },
    });
};

const changeStatus = async (id, status) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid listing id",
        };
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return {
            success: false,
            status: 404,
            message: "Listing not found",
        };
    }

    const updated = await Listing.findByIdAndUpdate(
        id,
        { status },
        { returnDocument: "after" }
    );

    await invalidateCache("/api/listings*");

    return {
        success: true,
        data: updated,
    };
};

const createStoreProduct = async (data, files = []) => {
    const payload = {
        ...data,
    };

    payload.images = [
        ...(data.images || []),
        ...uploadedPaths(files),
    ];

    payload.status =
        pickProductStatus(data.status) || "draft";

    const listing = await Listing.create(payload);

    await invalidateCache("/api/listings*");

    return {
        success: true,
        data: listing,
    };
};

const updateListing = async (id, data, files = []) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid listing id",
        };
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return {
            success: false,
            status: 404,
            message: "Listing not found",
        };
    }

    const updateData = {
        ...data,
    };

    PROTECTED_FIELDS.forEach((field) => {
        delete updateData[field];
    });

    const status = pickProductStatus(data.status);

    if (status) {
        updateData.status = status;
    }

    // images = the ones the admin kept + the new uploads
    if (data.images || files?.length) {
        updateData.images = [
            ...(data.images ?? listing.images),
            ...uploadedPaths(files),
        ];
    }

    Object.assign(listing, updateData);

    await listing.save();

    await invalidateCache("/api/listings*");

    return {
        success: true,
        data: {
            listing,
            needsReview: false,
        },
    };
};

const deleteListing = async (id) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid listing id",
        };
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return {
            success: false,
            status: 404,
            message: "Listing not found",
        };
    }

    listing.status = "deleted";

    await listing.save();

    await invalidateCache("/api/listings*");

    return {
        success: true,
    };
};

const getListingPreview = async (id) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid listing id",
        };
    }

    const listingData = await Listing.findById(id)
        .populate("categoryPath", "_id title slug")
        .lean();

    if (!listingData) {
        return {
            success: false,
            status: 404,
            message: "Listing not found",
        };
    }

    return {
        success: true,
        data: {
            listingData,
            preview: true,
        },
    };
};

export  {
    createStoreProduct,
    updateListing,
    deleteListing,
    getListingPreview,
    getAllListingsAdmin,
    changeStatus,
};