import Ticket from "@/model/ticket";
import { paginate } from "@/utils/paginate";

const getAllTickets = async (query = {}) => {
    return paginate(Ticket, {
        limit: query.limit,
        cursor: query.cursor,
        populate: [
            { path: "user", select: "name email" },
            { path: "departmentID", select: "title" },
            { path: "product", select: "title" },
        ],
        sort: { _id: -1 },
    });
};

export  {
    getAllTickets,
};

export default {
    getAllTickets,
};
