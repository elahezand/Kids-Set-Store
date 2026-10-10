import mongoose from "mongoose";
import Department from "@/model/department";
import SubDepartment from "@/model/subDepartment";
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
    const department = await Department.create(data);

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

const updateDepartment = async (id, data) => {
  if (data.title !== undefined) {
    const titleTaken = await Department.exists({
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
    const department = await Department.findByIdAndUpdate(id, data, {
      new: true,
    });

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
  const ticketsCount = await Ticket.countDocuments({
    department: id,
  });

  if (ticketsCount > 0) {
    return {
      success: false,
      status: 409,
      message: `${ticketsCount} tickets use this department. Deactivate it instead of deleting.`,
    };
  }

  const department = await Department.findByIdAndDelete(id);

  if (department) {
    await SubDepartment.deleteMany({ department: id });
  }

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

const getDepartmentsOverview = async () => {
  const [departments, subDepartments, ticketCounts] = await Promise.all([
    Department.find().sort({ order: 1, title: 1 }).lean(),
    SubDepartment.find().sort({ title: 1 }).select("title department").lean(),
    Ticket.aggregate([
      { $match: { parent: null } },
      {
        $group: {
          _id: { department: "$department", subDepartment: "$subDepartment" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const byDepartment = new Map();
  const bySub = new Map();

  for (const row of ticketCounts) {
    const departmentKey = String(row._id.department);
    byDepartment.set(departmentKey, (byDepartment.get(departmentKey) || 0) + row.count);
    bySub.set(String(row._id.subDepartment), row.count);
  }

  return departments.map((department) => ({
    id: String(department._id),
    title: department.title,
    description: department.description ?? null,
    isActive: department.isActive !== false,
    order: department.order ?? 0,
    createdAt: department.createdAt,
    ticketsCount: byDepartment.get(String(department._id)) || 0,
    subDepartments: subDepartments
      .filter((sub) => String(sub.department) === String(department._id))
      .map((sub) => ({
        id: String(sub._id),
        title: sub.title,
        ticketsCount: bySub.get(String(sub._id)) || 0,
      })),
  }));
};

const notFound = (message) => ({ success: false, status: 404, message });

const subTitleTaken = (departmentId, title, exceptId = null) =>
  SubDepartment.exists({
    department: departmentId,
    title,
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  }).collation(CASE_INSENSITIVE);

const createSubDepartment = async ({ department, title }) => {
  if (!mongoose.isValidObjectId(department) || !(await Department.exists({ _id: department }))) {
    return notFound("Department not found");
  }

  if (await subTitleTaken(department, title)) {
    return { success: false, status: 409, message: "This department already has that topic" };
  }

  const sub = await SubDepartment.create({ department, title });
  return { success: true, data: sub };
};

const updateSubDepartment = async (id, { title }) => {
  const sub = await SubDepartment.findById(id);
  if (!sub) return notFound("Topic not found");

  if (await subTitleTaken(sub.department, title, id)) {
    return { success: false, status: 409, message: "This department already has that topic" };
  }

  sub.title = title;
  await sub.save();
  return { success: true, data: sub };
};

const deleteSubDepartment = async (id) => {
  const ticketsCount = await Ticket.countDocuments({ subDepartment: id });

  if (ticketsCount > 0) {
    return {
      success: false,
      status: 409,
      message: `${ticketsCount} tickets use this topic, so it can't be deleted. Rename it instead.`,
    };
  }

  const sub = await SubDepartment.findByIdAndDelete(id);
  if (!sub) return notFound("Topic not found");

  return { success: true };
};

export {
  getDepartmentsOverview,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

export default {
  getDepartmentsOverview,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
