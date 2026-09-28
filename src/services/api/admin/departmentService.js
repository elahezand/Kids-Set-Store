import Department from "@/model/department";
import Ticket from "@/model/ticket";

const CASE_INSENSITIVE = {
    locale: "en",
    strength: 2,
};

const getDepartments = async () => {
    return Department.find().sort({
        order: 1,
        title: 1,
    });
};

const createDepartment = async (data) => {
    const exists = await Department.exists({
        title: data.title,
    }).collation(CASE_INSENSITIVE);

    if (exists) {
        return {
            success: false,
            status: 409,
            message: "Department already exists",
        };
    }

    try {
        const department =
            await Department.create(data);

        return {
            success: true,
            data: department,
        };
    } catch (err) {
        if (err?.code === 11000) {
            return {
                success: false,
                status: 409,
                message: "Department already exists",
            };
        }

        throw err;
    }
};

const updateDepartment = async (
    id,
    data
) => {
    if (data.title !== undefined) {
        const titleTaken =
            await Department.exists({
                _id: { $ne: id },
                title: data.title,
            }).collation(CASE_INSENSITIVE);

        if (titleTaken) {
            return {
                success: false,
                status: 409,
                message: "Department already exists",
            };
        }
    }

    try {
        const department =
            await Department.findByIdAndUpdate(
                id,
                data,
                {
                    new: true,
                }
            );

        if (!department) {
            return {
                success: false,
                status: 404,
                message: "Department not found",
            };
        }

        return {
            success: true,
            data: department,
        };
    } catch (err) {
        if (err?.code === 11000) {
            return {
                success: false,
                status: 409,
                message: "Department already exists",
            };
        }

        throw err;
    }
};

const deleteDepartment = async (id) => {
    const ticketsCount =
        await Ticket.countDocuments({
            department: id,
        });

    if (ticketsCount > 0) {
        return {
            success: false,
            status: 409,
            message: `${ticketsCount} tickets use this department. Deactivate it instead of deleting.`,
        };
    }

    const department =
        await Department.findByIdAndDelete(id);

    if (!department) {
        return {
            success: false,
            status: 404,
            message: "Department not found",
        };
    }

    return {
        success: true,
    };
};

export  {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};