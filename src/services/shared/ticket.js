import Ticket from "@/model/ticket";

const getTicketById = async (id) => {
    const tickets = await Ticket.find({})
        .populate("user", "name email")
        .populate("departmentID", "title")
        .populate("course", "title")
        .lean();

    const ticketMap = new Map();

    tickets.forEach((ticket) => {
        ticketMap.set(String(ticket._id), {
            ...ticket,
            children: [],
        });
    });

    tickets.forEach((ticket) => {
        if (ticket.parent) {
            const parent = ticketMap.get(
                String(ticket.parent)
            );

            if (parent) {
                parent.children.push(ticket);
            }
        }
    });

    const ticket = ticketMap.get(String(id));

    if (!ticket) {
        return {
            success: false,
            status: 404,
            message: "Not Found :)",
        };
    }

    return {
        success: true,
        data: ticket,
    };
};
const createAnswer = async (ticketId, userId, content) => {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        return {
            success: false,
            status: 404,
            message: "NOT found :(",
        };
    }

    ticket.isAnswer = 1;
    await ticket.save();

    const answer = await Ticket.create({
        parent: ticket._id,
        title: `Answer: ${ticket.title}`,
        content,
        user: userId,
        priority: ticket.priority,
        department: ticket.department,
        subDepartment: ticket.subDepartment,
        isAnswer: 0,
    });

    return {
        success: true,
        data: answer,
    };
};

export  {
    getTicketById,
    createAnswer
};

export default {
    getTicketById,
    createAnswer,
};
