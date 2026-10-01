import Ticket from "@/model/ticket";
import { paginateList } from "@/utils/listQuery";

const getMyTickets = async (userId, query = {}) =>
    paginateList(Ticket, query, {
        base: { user: userId, parent: null },
        search: ["title"],
        populate: [
            { path: "department", select: "title" },
            { path: "subDepartment", select: "title" },
        ],
    });

export {
    getMyTickets,
};

export default {
    getMyTickets,
};
