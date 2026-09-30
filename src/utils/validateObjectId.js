import { isValidObjectId } from "mongoose";

const validateObjectId = (id) => {
    return isValidObjectId(id);
};

export default validateObjectId;