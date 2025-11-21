import connectToDB from "../../../../../db/db"
import { cookies } from "next/headers"
export async function POST() {
    connectToDB()
    try {
        const cookiesStore = await cookies()
        cookiesStore.delete("token")
        return Response.json({messsage:"You LogOut Successfully"}, { status: 200 })

    }
    catch (err) {
        return Response.json({ message: "UnKnownError" }, { status: 500 })

    }

}
