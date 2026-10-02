import { isValidObjectId } from "mongoose";
import Ticket from "@/model/ticket";
// registered so populate("department" / "subDepartment") works
import "@/model/department";
import "@/model/subDepartment";

const AUTHOR = { path: "user", select: "username email role" };

const isAdminUser = (user) => [].concat(user?.role ?? []).includes("ADMIN");

/**
 * A ticket and its replies (oldest first).
 * ownerId -> only the owner may read it (user panel). Without it -> any ticket (admin panel).
 */
const getTicketThread = async (id, { ownerId } = {}) => {
    if (!isValidObjectId(id)) {
        return { success: false, status: 400, message: "Invalid ticket id" };
    }

    const ticket = await Ticket.findOne({
        _id: id,
        parent: null,
        ...(ownerId ? { user: ownerId } : {}),
    })
        .populate(AUTHOR)
        .populate("department", "title")
        .populate("subDepartment", "title")
        .lean();

    if (!ticket) {
        return { success: false, status: 404, message: "Ticket not found" };
    }

    const children = await Ticket.find({ parent: ticket._id })
        .sort({ createdAt: 1 })
        .select("content user createdAt")
        .populate(AUTHOR)
        .lean();

    return { success: true, data: { ...ticket, children } };
};

/**
 * Reply to a ticket.
 * - the owner can reply to their own ticket -> ticket goes back to "waiting"
 * - an admin can reply to any ticket       -> ticket becomes "answered"
 */
const createAnswer = async (ticketId, author, content) => {
    if (!isValidObjectId(ticketId)) {
        return { success: false, status: 400, message: "Invalid ticket id" };
    }

    const byAdmin = isAdminUser(author);

    const ticket = await Ticket.findOne({
        _id: ticketId,
        parent: null,
        ...(byAdmin ? {} : { user: author._id }),
    });

    if (!ticket) {
        return { success: false, status: 404, message: "Ticket not found" };
    }

    const answer = await Ticket.create({
        parent: ticket._id,
        title: `Re: ${ticket.title}`,
        content,
        user: author._id,
        priority: ticket.priority,
        department: ticket.department,
        subDepartment: ticket.subDepartment,
        isAnswer: byAdmin,
    });

    ticket.isAnswer = byAdmin;
    await ticket.save();

    return { success: true, data: answer.toJSON() };
};

export { getTicketThread, createAnswer };

export default { getTicketThread, createAnswer };
