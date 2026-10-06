import Newsletter from "@/model/newsletter";
import { paginateList } from "@/utils/listQuery";

const getAll = async (searchParams) => {
    const query =
        searchParams instanceof URLSearchParams
            ? Object.fromEntries(searchParams.entries())
            : searchParams || {};

    return paginateList(Newsletter, query, { search: ["email"] });
};

const countAll = () => Newsletter.countDocuments();

export {
    getAll,
    countAll,
};

export default {
    getAll,
    countAll,
};
