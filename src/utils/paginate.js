const paginate = async (
    Model,
    {
        limit,
        cursor = null,
        filters = {},
        sort = { createdAt: -1 },
        populate = null,
        select = null,
    } = {}
) => {
    limit = Math.min(
        Math.max(Number(limit) || 15, 1),
        99
    );

    const sortKeys = Object.keys(sort);

    const sortKey = sortKeys[0] || "_id";
    const sortOrder = sort[sortKey];

    const query = { ...filters };

    /*
     * Cursor
     */
    if (cursor) {
        try {
            const decoded = JSON.parse(
                Buffer.from(cursor, "base64").toString("utf8")
            );

            const cursorValue = decoded.value;
            const cursorId = decoded.id;

            if (sortKey === "_id") {
                query._id =
                    sortOrder === 1
                        ? { $gt: cursorId }
                        : { $lt: cursorId };
            } else {
                const operator =
                    sortOrder === 1 ? "$gt" : "$lt";

                query.$or = [
                    {
                        [sortKey]: {
                            [operator]: cursorValue,
                        },
                    },
                    {
                        [sortKey]: cursorValue,
                        _id:
                            sortOrder === 1
                                ? { $lt: cursorId }
                                : { $gt: cursorId },
                    },
                ];
            }
        } catch (error) {
            console.error(
                "Invalid pagination cursor:",
                error
            );

            return {
                data: [],
                pagination: {
                    limit,
                    nextCursor: null,
                    hasMore: false,
                },
            };
        }
    }

    let dbQuery = Model.find(query)
        .sort(sort)
        .limit(limit + 1)
        .lean();

    if (populate) {
        dbQuery = dbQuery.populate(populate);
    }

    if (select) {
        dbQuery = dbQuery.select(select);
    }

    const data = await dbQuery;

    const hasMore = data.length > limit;

    if (hasMore) {
        data.pop();
    }

    let nextCursor = null;

    if (hasMore && data.length) {
        const lastItem = data[data.length - 1];

        const cursorData = {
            value: lastItem[sortKey],
            id: lastItem._id,
        };

        nextCursor = Buffer.from(
            JSON.stringify(cursorData)
        ).toString("base64");
    }

    return {
        data,
        pagination: {
            limit,
            nextCursor,
            hasMore,
        },
    };
};

/**
 * Page-number pagination for dashboard tables (?page=2&limit=10).
 * `params` is the page's searchParams; returns { data, totalCount, pageCount, page, limit }.
 */
const paginatePage = async (
    Model,
    params = {},
    filters = {},
    populate = null,
    sort = { createdAt: -1 }
) => {
    const limit = Math.min(Math.max(Number(params?.limit) || 10, 1), 99);
    const requested = Math.max(Number(params?.page) || 1, 1);

    const totalCount = await Model.countDocuments(filters);
    const pageCount = Math.max(Math.ceil(totalCount / limit), 1);
    const page = Math.min(requested, pageCount);

    let query = Model.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    if (populate) query = query.populate(populate);

    const data = await query;

    return { data, totalCount, pageCount, page, limit };
};

module.exports = {
    paginate,
    paginatePage,
};
