import connectToDB from "../../../../configs/db";
import SubDepartmentModel from "../../../../model/subDepartment";
import DepartmentModel from "../../../../model/department";
import { authAdmin } from "@/utils/serverHelper";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();

    const subDepartments = await SubDepartmentModel.find()
      .populate("department", "title")
      .lean();

    return NextResponse.json({ subDepartments }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin)
      return NextResponse.json(
        { message: "This API is protected" },
        { status: 403 }
      );

    const body = await req.json();
    const { title, department } = body;

    if (!title?.trim())
      return NextResponse.json(
        { message: "Title Not Valid :(" },
        { status: 422 }
      );

    if (!department)
      return NextResponse.json(
        { message: "Department is required" },
        { status: 422 }
      );

    const depExists = await DepartmentModel.findById(department);
    if (!depExists)
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 }
      );

    const newSub = await SubDepartmentModel.create({
      title,
      department,
    });

    return NextResponse.json(
      { message: "SubDepartment created Successfully", subDepartment: newSub },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
  }
}
