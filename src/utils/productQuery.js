import CategoryModel from "../../model/category";

export async function buildProductQuery(params = {}) {
    const {
        category,
        color,
        material,
        max,
        value,
        sort,
    } = params;

    const filters = {};

    // Category
    if (category) {
        const categoryDoc = await CategoryModel.findOne({
            slug: category,
        })
            .select("_id")
            .lean();

        if (categoryDoc) {
            filters.categoryPath = categoryDoc._id;
        }
    }

    // Color
    if (color && color !== "-1") {
        filters.color = color;
    }

    // Material
    if (material && material !== "-1") {
        filters.material = {
            $regex: material,
            $options: "i",
        };
    }

    // Max price
    if (max) {
        const price = Number(max);

        if (!Number.isNaN(price)) {
            filters.price = {
                $lte: price,
            };
        }
    }

    // Best selling
    if (value === "bestSelling") {
        filters.score = {
            $gte: 4,
        };
    }

    // Sort
    let sortOption = {
        _id: -1,
    };

    switch (sort) {
        case "price":
            sortOption = {
                price: 1,
                _id: -1,
            };
            break;

        case "popularity":
            sortOption = {
                score: -1,
                _id: -1,
            };
            break;

        case "latest":
            sortOption = {
                _id: -1,
            };
            break;

        default:
            sortOption = {
                _id: -1,
            };
    }

    return {
        filters,
        sort: sortOption,
    };
}