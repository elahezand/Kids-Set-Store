import Contact from "@/model/contact";
import { paginateList } from "@/utils/listQuery";
import sendEmail from "@/utils/sendEmail";

const POPULATE = [
    // only paths that exist in model/contact (Mongoose strictPopulate)
    { path: "answeredBy", select: "username" },
];

const escapeHtml = (text = "") =>
    String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const getContacts = async (query = {}) => {
    const [result, unreadCount] = await Promise.all([
        paginateList(Contact, query, {
            statuses: ["pending", "answered"],
            search: ["name", "email", "phone"],
            populate: POPULATE,
        }),
        Contact.countDocuments({ status: "pending" }),
    ]);

    return { ...result, meta: { unreadCount } };
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

export default {
    getContacts,
    getContactById,
    answerContact,
    updateContact,
    deleteContact,
};
