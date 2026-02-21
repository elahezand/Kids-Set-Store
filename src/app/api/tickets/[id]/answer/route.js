import connectToDB from "../../../../../../configs/db";
import ticketModel from "../../../../../../model/ticket";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { authUser } from "@/utils/serverHelper";

export async function POST(req, { params }) {
    try {
        await connectToDB()

        const user = await authUser();
        if (!user) throw new Error("This API is protected");

        const { id } = await params;

        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { message: "Not Valid :)" },
                { status: 422 }
            );
        }

        const { content } = await req.json();
        if (!content || content.trim().length < 3)
            return NextResponse.json({ message: "content required :(" }, { status: 422 });

        const ticket = await ticketModel.findById(id);

        if (!ticket) return NextResponse.json({ message: "NOT found :(" }, { status: 404 });

        ticket.isAnswer = 1;
        await ticket.save();

        const answer = await ticketModel.create({
            parent: ticket._id,
            title: `Answer: ${ticket.title}`,
            content,
            user: user._id,
            priority:ticket.priority,
            department: ticket.department,
            subDepartment:ticket.subDepartment,
            isAnswer: 0,
        });

        return NextResponse.json({ message: "answer send succeessfully", answer }, { status: 200 });

    } catch (err) {
        console.log(err);

        return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
    }
};
