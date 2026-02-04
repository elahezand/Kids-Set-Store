import connectToDB from "../../../../../configs/db";
import { authAdmin } from "@/utils/serverHelper";
import commentModel from "../../../../../model/comment";
import { paginate } from "@/utils/helper";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        await connectToDB();
        const { id } = await params;

        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not valid ID" }, { status: 422 });

        const { searchParams } = new URL(req.url);
        const useCursor = searchParams.has("cursor");

        const result = await paginate(
            commentModel,   // Model
            searchParams,   // searchParams
            { userID: id },             // filter
            null,           // populate
            useCursor,
            true     // cursor | pagination
        );

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectToDB();
        const admin = await authAdmin();
        if (!admin) throw new Error("This API is protected");

        const { id } = await params;
        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not valid ID" }, { status: 422 });

        const { body } = await req.json();

        await commentModel.findOneAndUpdate(
            { _id: id },
            { $set: { body: body } },
            { new: true }
        );

        return NextResponse.json({ message: "Comment updated successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDB();
        const admin = await authAdmin();
        if (!admin) throw new Error("This API is protected");

        const { id } = await params;

        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not valid ID" }, { status: 422 });

        await commentModel.findOneAndDelete({ _id: id });
        return NextResponse.json({ message: "Comment removed successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
