import DepartmentModel from "../../../../model/department";
import connectToDB from "../../../../configs/db";
import { authAdmin } from "@/utils/serverHelper";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();

    const departments = await DepartmentModel.find({}, "-__v").lean();

    return NextResponse.json({ departments }, { status: 200 });
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
    const { title } = body;

    if (!title?.trim())
      return NextResponse.json(
        { message: "Title Not Valid :(" },
        { status: 422 }
      );

    const exists = await DepartmentModel.findOne({ title });
    if (exists)
      return NextResponse.json(
        { message: "Department already exists" },
        { status: 409 }
      );

    const newDepartment = await DepartmentModel.create({ title });

    return NextResponse.json(
      {
        message: "Department created Successfully",
        department: newDepartment,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
  }
}
