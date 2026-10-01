import Ticket from "@/model/ticket";
import { paginateList } from "@/utils/listQuery";

const getAllTickets = async (query = {}) =>
    paginateList(Ticket, query, {
        base: { parent: null },
        search: ["title"],
        ids: { user: "user", department: "department" },
        populate: [
            { path: "user", select: "username phone email" },
            { path: "department", select: "title" },
            { path: "subDepartment", select: "title" },
        ],
    });

export  {
    getAllTickets,
};

export default {
    getAllTickets,
};
