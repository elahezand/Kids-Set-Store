import connectToDB from "../../../../../db/db";
import FavoriteModel from "../../../../../model/favorite";
import { authUser } from "@/utils/serverHelper";
import { isValidObjectId } from "mongoose";
export async function GET(req, params) {
    try {

        connectToDB()
        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const favorites = await FavoriteModel.find({ userID: id })
            .populate("productID").lean()

        return Response.json(favorites, { satatus: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { satatus: 500 })

    }
}


export async function DELETE(req, { params }) {

    try {
        connectToDB()
        const user = await authUser()
        if (!user) return Response.json({ message: "Please LogIn First" }, { satatus: 401 })


        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })


        await FavoriteModel.findOneAndDelete({ _id: id })

        return Response.json({ message: "Item Removed Successfully :)" }, { satatus: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { satatus: 500 })

    }
}