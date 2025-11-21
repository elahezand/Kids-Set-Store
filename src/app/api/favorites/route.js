import connectToDB from "../../../../db/db";
import FavoriteModel from "../../../../model/favorite"
import { isValidObjectId } from "mongoose";
import ProductModal from "../../../../model/product";

export async function GET() {
    try {
        connectToDB()
        const favorites = await FavoriteModel.find({})
        return Response.json({ data: favorites }, { satatus: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { satatus: 500 })

    }
}

export async function POST(req) {
    try {
        connectToDB()
        const body = await req.json()
        const { userID, productID } = body

        const isvalidUserId = isValidObjectId(userID)
        const isvalidProductId = isValidObjectId(productID)
        if (!isvalidUserId || !isvalidProductId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const isProductExist = await ProductModal.findOne({ _id: productID })

        if (!isProductExist) return Response.json({ massage: "NOT FOUND" }, { satatus: 404 })


        const isFavoriteExist = await FavoriteModel.findOne({ productID: isProductExist._id })

        if (!isFavoriteExist) {
            await FavoriteModel.create({
                userID,
                productID
            })
        }

        return Response.json({ massage: " PRODUCT ADDED to Favorite List Successfully :)" }, { satatus: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { satatus: 500 })
    }
}

