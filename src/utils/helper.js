import toast from "react-hot-toast";

export const showToast = (message, type = "default") => {
    if (type === "success") toast.success(message);
    else if (type === "destructive") toast.error(message);
    else toast(message);
};
export const manageError = (error) => {
    let message = null
    if (error === 400) message = "Please fill out required fields correctly.";
    else if (error === 401 || error === 403) message = "Unauthorized request.";
    else if (error === 404) message = "Not found.";
    else if (error === 409) message = "This account already exists.";
    else if (error === 410) message = "Code expired.";
    else if (error === 422) message = "Your information is not valid.";
    else if (error === 500) message = "Server error.";
    else message = `Unexpected error (${error || "unknown"})`;

    toast.error(message);
};
export async function paginate(Model, searchParams, filter = {}, populate = null, useCursor = false, route = false, sortOption = { _id: -1 }) {
    let limit, page, cursor;

    if (route) {
        limit = Number(searchParams?.get("limit")) || 15;
        page = Number(searchParams?.get("page")) || 1;
        cursor = searchParams?.get("cursor");
    } else {
        limit = Number(searchParams?.limit) || 15;
        page = Number(searchParams?.page) || 1;
        cursor = searchParams?.cursor;
    }

    if (useCursor) {
        const query = cursor
            ? { ...filter, _id: { $lt: cursor } }
            : { ...filter };

        const data = await Model.find(query)
            .sort(sortOption)
            .limit(limit + 1)
            .populate(populate)
            .lean();

        const hasNextPage = data.length > limit;
        if (hasNextPage) data.pop();

        const nextCursor = hasNextPage
            ? data[data.length - 1]._id.toString()
            : null;

        return { data, nextCursor, limit };
    } else {
        const skip = (page - 1) * limit;
        const totalCount = await Model.countDocuments(filter);

        const data = await Model.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate(populate)
            .lean();

        const pageCount = Math.ceil(totalCount / limit);
        return { data, totalCount, pageCount, page, limit };
    }
}

export default showToast