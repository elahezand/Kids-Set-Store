import Contact from "@/model/contact";
import sendEmail from "@/utils/sendEmail";
import { paginate } from "@/utils/paginate";

const POPULATE = [
    {
        path: "user",
        select: "name username",
    },
    {
        path: "handledBy",
        select: "name username",
    },
    {
        path: "answeredBy",
        select: "name username",
    },
];

const escapeHtml = (text = "") =>
    String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const getContacts = async (query = {}) => {
    const {
        status,
        limit,
        cursor,
    } = query;

    const [result, unreadCount] =
        await Promise.all([
            paginate(Contact, {
                limit,
                cursor: cursor ?? null,
                filters: status
                    ? { status }
                    : {},
                sort: {
                    _id: -1,
                },
            }),

            Contact.countDocuments({
                status: "new",
            }),
        ]);

    const data =
        await Contact.populate(
            result.data || [],
            POPULATE
        );

    return {
        data,
        pagination: result.pagination,
        unreadCount,
    };
};

const getContactById = async (
    id,
    adminId
) => {
    const contact =
        await Contact.findById(id);

    if (!contact) {
        return {
            success: false,
            status: 404,
            message: "Message not found",
        };
    }

    if (contact.status === "new") {
        contact.status = "read";
        contact.readAt = new Date();
        contact.handledBy = adminId;

        await contact.save();
    }

    await contact.populate(POPULATE);

    return {
        success: true,
        data: contact,
    };
};

const answerContact = async (
    id,
    adminId,
    answer
) => {
    const contact =
        await Contact.findById(id);

    if (!contact) {
        return {
            success: false,
            status: 404,
            message: "Contact not found",
        };
    }

    if (contact.status === "answered") {
        return {
            success: false,
            status: 400,
            message: "Already answered",
        };
    }

    contact.status = "answered";
    contact.answer = answer;
    contact.answeredBy = adminId;
    contact.answeredAt = new Date();

    await contact.save();

    setImmediate(() => {
        sendEmail(
            contact.email,
            `Dear ${contact.name}`,
            `<p style="white-space: pre-line;">${escapeHtml(answer)}</p>`
        ).catch((err) =>
            console.error(
                "Contact answer email failed:",
                err
            )
        );
    });

    await contact.populate(POPULATE);

    return {
        success: true,
        data: contact,
    };
};

const updateContact = async (
    id,
    adminId,
    data
) => {
    const contact =
        await Contact.findById(id);

    if (!contact) {
        return {
            success: false,
            status: 404,
            message: "Message not found",
        };
    }

    const {
        status,
        adminNote,
    } = data;

    const now = new Date();

    if (adminNote !== undefined) {
        contact.adminNote =
            adminNote || null;
    }

    if (
        status &&
        status !== contact.status
    ) {
        contact.status = status;
        contact.handledBy = adminId;

        if (
            !contact.readAt &&
            status !== "new"
        ) {
            contact.readAt = now;
        }

        if (status === "answered") {
            contact.answeredAt = now;
        }

        if (status === "new") {
            contact.readAt = null;
        }
    }

    await contact.save();

    await contact.populate(POPULATE);

    return {
        success: true,
        data: contact,
    };
};

const deleteContact = async (id) => {
    const contact =
        await Contact.findByIdAndDelete(id);

    if (!contact) {
        return {
            success: false,
            status: 404,
            message: "Message not found",
        };
    }

    return {
        success: true,
    };
};

export  {
    getContacts,
    getContactById,
    answerContact,
    updateContact,
    deleteContact,
};