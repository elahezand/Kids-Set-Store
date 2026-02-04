import connectToDB from "../../configs/db";
import CategoryModel from "../../model/category";

export const handleTree = async () => {
    await connectToDB();
    const categories = await CategoryModel.find({}).lean();

    const buildChildren = (parentId) => {
        return categories
            .filter(cat => cat.parentId?.toString() === parentId.toString())
            .map(cat => ({
                _id: cat._id.toString(),
                name: cat.slug,
                children: buildChildren(cat._id)
            }));
    }

    const tree = categories
        .filter(cat => !cat.parentId)
        .map(cat => ({
            _id: cat._id.toString(),
            name: cat.slug,
            children: buildChildren(cat._id)
        }));

    return tree
}