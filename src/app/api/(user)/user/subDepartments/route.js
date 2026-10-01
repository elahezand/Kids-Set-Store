import connectToDB from "@/configs/db";
import { respond } from "@/utils/apiResponse";
import SubDepartmentModel from "@/model/subDepartment";
import DepartmentModel from "@/model/department";
import { authAdmin } from "@/utils/auth/authGuard";

export async function GET() {
  try {
    await connectToDB();

    const subDepartments = await SubDepartmentModel.find()
      .populate("department", "title")
      .lean();

    return respond({ subDepartments }, { status: 200 });
  } catch (err) {
    console.log(err);
    return respond({ message: "Unknown Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin)
      return respond(
        { message: "This API is protected" },
        { status: 403 }
      );

    const body = await req.json();
    const { title, department } = body;

    if (!title?.trim())
      return respond(
        { message: "Title Not Valid :(" },
        { status: 422 }
      );

    if (!department)
      return respond(
        { message: "Department is required" },
        { status: 422 }
      );

    const depExists = await DepartmentModel.findById(department);
    if (!depExists)
      return respond(
        { message: "Department not found" },
        { status: 404 }
      );

    const newSub = await SubDepartmentModel.create({
      title,
      department,
    });

    return respond(
      { message: "SubDepartment created Successfully", subDepartment: newSub },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return respond({ message: "Unknown Error" }, { status: 500 });
  }
}
