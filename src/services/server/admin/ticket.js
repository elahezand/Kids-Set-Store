import Ticket from "@/model/ticket";
import Department from "@/model/department";
import SubDepartment from "@/model/subDepartment";
import { paginateList } from "@/utils/listQuery";

/* ?status=answered | waiting  ->  isAnswer true | false  (anything else = all) */
const TICKET_STATUS = { answered: true, waiting: false };

/* GET /api/admin/tickets?status=&q=&user=&department=&limit=&cursor= (first messages only, not replies) */
const getAllTickets = async ({ status, ...query } = {}) =>
    paginateList(Ticket, query, {
        defaultLimit: 15,
        maxLimit: 50,
        base: { parent: null },
        filters: Object.hasOwn(TICKET_STATUS, status) ? { isAnswer: TICKET_STATUS[status] } : {},
        search: ["title"],
        ids: { user: "user", department: "department" },
        select: "title priority isAnswer department subDepartment user createdAt",
        populate: [
            { path: "user", select: "username phone email" },
            { path: "department", select: "title", model: Department },
            { path: "subDepartment", select: "title", model: SubDepartment },
        ],
    });

export { getAllTickets };

export default {
    getAllTickets,
};
