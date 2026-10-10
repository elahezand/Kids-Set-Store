import { isValidObjectId } from "mongoose";
import Ticket from "@/model/ticket";
import Department from "@/model/department";
import SubDepartment from "@/model/subDepartment";
import { paginateList } from "@/utils/listQuery";
import { ticketValidationSchema } from "@/validators/ticket";
import { getTicketThread } from "@/services/server/shared/ticket";

const TICKET_STATUS = { answered: true, waiting: false };

const getMyTickets = async (userId, { status, ...query } = {}) =>
  paginateList(Ticket, query, {
    defaultLimit: 10,
    maxLimit: 50,
    base: { user: userId, parent: null },
    filters: Object.hasOwn(TICKET_STATUS, status) ? { isAnswer: TICKET_STATUS[status] } : {},
    search: ["title"],
    select: "title priority isAnswer department subDepartment createdAt",
    populate: [
      { path: "department", select: "title", model: Department },
      { path: "subDepartment", select: "title", model: SubDepartment },
    ],
  });

const getMyTicket = (ticketId, userId) => getTicketThread(ticketId, { ownerId: userId });

const getDepartments = async () => {
  const [departments, subDepartments] = await Promise.all([
    Department.find({ isActive: { $ne: false } })
      .sort({ order: 1, title: 1 })
      .select("title")
      .lean(),
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

export default { getMyTickets, getMyTicket, getDepartments, createTicket };
