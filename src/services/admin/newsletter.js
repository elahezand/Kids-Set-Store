import Newsletter from "@/model/newsletter";
import { paginate } from "@/utils/paginate";

const getAll = async (searchParams) => {
    const params =
        searchParams instanceof URLSearchParams
            ? Object.fromEntries(searchParams.entries())
            : searchParams || {};

    return await paginate(Newsletter, {
        limit: params.limit,
        cursor: params.cursor,
        sort: {
            _id: -1,
        },
    });
};

export {
    getAll,
};

export default {
    getAll,
};
