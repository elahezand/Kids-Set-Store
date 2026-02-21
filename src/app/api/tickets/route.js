import connectToDB from "../../../../configs/db";
import ticketModel from "../../../../model/ticket";
import { authUser } from "@/utils/serverHelper";
import { NextResponse } from "next/server";
import { ticketValidationSchema } from "../../../../validators/ticket";

export async function GET() {
    try {
        await connectToDB();
        const tickets = await ticketModel
            .find({}, "-__v")
            .populate("user", "username role")
            .lean();

        return NextResponse.json(tickets, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDB();
        const user = await authUser();
        if (!user)
            return NextResponse.json({ message: "Please log in first :(" }, { status: 401 });

        const reqBody = await req.json();

        // Validate with Zod
        const parseResult = ticketValidationSchema.safeParse(reqBody);

        if (!parseResult.success) {
            const firstError = parseResult.error?.errors?.[0];
            return NextResponse.json(
                {
                    message: firstError?.message || "Invalid data",
                    field: firstError?.path?.[0] || null,
                },
                { status: 422 }
            );
        }

        const newTicket = await ticketModel.create({
            ...parsed.data,
            user: req.user._id,
        });

        return NextResponse.json({ message: "Ticket sent successfully" ,newTicket}, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
    }
}
