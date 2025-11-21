import connectToDB from "../../../../db/db";
import TicketModel from "../../../../model/ticket";
import { authUser } from "@/utils/serverHelper";

export async function GET() {
    try {
        connectToDB()
        const Tickets = await TicketModel.find({}, "-__v")
            .populate("userID", "username")
            .lean()
        return Response.json(Tickets, { status: 200 })
    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
export async function POST(req) {
    try {
        connectToDB()
        const user = await authUser()
        if (!user) return Response.json({ message: "Please LogIn First :(" }, { status: 401 })

        const reqBody = await req.json()

        const { subject, message, department, priority, subDepartment, status, answerBy } = reqBody

        if (!subject.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })


        await TicketModel.create({
            userID: user._id,
            subject,
            message: [{ senderID: user._id, content: message, createdAt: new Date() }],
            department,
            priority,
            subDepartment,
            status,
            answerBy
        })
        return Response.json({ message: "Ticket sended Successfully" }, { status: 200 })

    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}



