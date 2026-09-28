export async function DELETE(req, { params }) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This API Protected")

        const { id } = params
        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not Valid ID" }, { status: 422 })

        await UserModel.findByIdAndDelete(id)
        return NextResponse.json({ message: "User Removed Successfully" }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }
}
