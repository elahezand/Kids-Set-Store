import Ticket from "@/model/ticket";
import { paginate } from "@/utils/paginate";

const getMyTickets = async (userId, query = {}) => {
    return paginate(Ticket, {
        limit: query.limit,
        cursor: query.cursor,
        filters: {
            user: userId,
            parent: null,
        },
        populate: [
            { path: "departmentID", select: "title" },
            { path: "product", select: "title" },
        ],
        sort: { _id: -1 },
    });
};

export {
    getMyTickets,
};

export default {
    getMyTickets,
};
