import connectToDB from "../../../../../configs/db";
import ticketModel from "../../../../../model/ticket";
import { authAdmin } from "@/utils/serverHelper";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { id } = await params;

    if (!isValidObjectId(id))
      return NextResponse.json({ message: "Not Valid :)" }, { status: 422 });

    const ticket = await ticketModel.findById(id)
      .populate("user", "name email")
      .populate("departmentID", "title")
      .populate("course", "title")
      .lean();

    if (!ticket) return NextResponse.json({ message: "Not Found :)" }, { status: 404 });

    const children = await ticketModel.find({ parent: ticket._id })
      .populate("user", "name email")
      .lean();

    ticket.children = children;

    return NextResponse.json(ticket, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const admin = await authAdmin();
    if (!admin) throw new Error("This API is protected");

    const { id } = await params;
    if (!isValidObjectId(id))
      return NextResponse.json({ message: "Not Valid :)" }, { status: 422 });

    await ticketModel.findOneAndDelete({ _id: id });

    return NextResponse.json({ message: "Ticket removed" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
  }
}
