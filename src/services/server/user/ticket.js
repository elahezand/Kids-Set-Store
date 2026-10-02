import { isValidObjectId } from "mongoose";
import Ticket from "@/model/ticket";
import Department from "@/model/department";
import SubDepartment from "@/model/subDepartment";
import { paginateList } from "@/utils/listQuery";
import { ticketValidationSchema } from "@/validators/ticket";
import { getTicketThread } from "@/services/server/shared/ticket";

/* GET /api/user/tickets  (?q= searches the subject) */
const getMyTickets = async (userId, query = {}) =>
    paginateList(Ticket, query, {
        defaultLimit: 10,
        maxLimit: 50,
        base: { user: userId, parent: null },
        search: ["title"],
        select: "title priority isAnswer department subDepartment createdAt",
        populate: [
            { path: "department", select: "title" },
            { path: "subDepartment", select: "title" },
        ],
    });

/* GET /api/user/tickets/:id  (only the owner) */
const getMyTicket = (ticketId, userId) => getTicketThread(ticketId, { ownerId: userId });

/* GET /api/user/departments  -> [{ _id, title, subDepartments: [{ _id, title }] }] */
const getDepartments = async () => {
    const [departments, subDepartments] = await Promise.all([
        Department.find({ isActive: { $ne: false } }).sort({ order: 1, title: 1 }).select("title").lean(),
        SubDepartment.find().sort({ title: 1 }).select("title department").lean(),
    ]);

    const byDepartment = new Map();
    for (const sub of subDepartments) {
        const key = String(sub.department);
        if (!byDepartment.has(key)) byDepartment.set(key, []);
        byDepartment.get(key).push({ _id: sub._id, title: sub.title });
    }

    return {
        success: true,
        data: departments.map((department) => ({
            _id: department._id,
            title: department.title,
            subDepartments: byDepartment.get(String(department._id)) ?? [],
        })),
    };
};

/* POST /api/user/tickets */
const createTicket = async (userId, body) => {
    const parsed = ticketValidationSchema.safeParse(body);
    if (!parsed.success) {
        return {
            success: false,
            status: 422,
            message: "Validation failed",
            details: parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        };
    }

    const { title, department, subDepartment, priority, content } = parsed.data;

    if (!isValidObjectId(department) || !isValidObjectId(subDepartment)) {
        return { success: false, status: 422, message: "Choose a valid department" };
    }

    // the sub-department must belong to the chosen department
    const sub = await SubDepartment.findOne({ _id: subDepartment, department }).select("_id").lean();
    if (!sub) {
        return { success: false, status: 422, message: "Sub-department does not match the department" };
    }

    const ticket = await Ticket.create({
        user: userId,
        title,
        department,
        subDepartment,
        priority,
        content,
        isAnswer: false,
        parent: null,
    });

    return { success: true, data: ticket.toJSON() };
};

export { getMyTickets, getMyTicket, getDepartments, createTicket };

export default { getMyTickets, getMyTicket, getDepartments, createTicket };
