import UserModal from "../../../../model/user";
import connectToDB from "../../../../db/db";
import { authAdmin } from "@/utils/serverHelper";
import { paginate } from "@/utils/helper";
import { userValidationSchema } from "../../../../validators/user";
export async function GET(req) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw ("This Api Protected")

        const { searchParams } = new URL(req.url);
        const useCursor = searchParams.has("cursor");

        const result = await paginate(
            UserModal,   // Model
            searchParams,   // searchParams
            {},             // filter
            "comments",           // populate
            useCursor,
            true      // cursor | pagination
        );
        return NextResponse.json(result, { status: 200 });
    }

    catch (err) {
        return NextResponse.json({ message: err.message}, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDB();
        const admin = await authAdmin();
        if (!admin) throw new Error("This API Protected");

        const body = await req.json();
        const parsed = userValidationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const isUserExist = await UserModal.findOne({ email: body.email });
        if (isUserExist) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        const newUser = await UserModal.create(parsed.data);
        return NextResponse.json({ message: "User Created Successfully", newUser }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
