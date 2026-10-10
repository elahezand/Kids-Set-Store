import Notification from "@/model/notification";
import { paginateList } from "@/utils/listQuery";
import { isValidObjectId } from "mongoose";

const getAll = async (userId, query = {}) => {
  const result = await paginateList(Notification, query, {
    base: { user: userId },
    sort: { _id: -1 },
  });

  return { success: true, ...result };
};

const get = async (id, ownerId) => {
  if (!isValidObjectId(id)) {
    return {
      success: false,
      status: 400,
      message: "Invalid id",
    };
  }

  const notification = await Notification.findOne({
    _id: id,
    user: ownerId,
  }).lean();

  if (!notification) {
    return {
      success: false,
      status: 404,
      message: "Notification not found",
    };
  }

  return {
    success: true,
    data: notification,
  };
};

const markSeen = async (id, ownerId) => {
  if (!isValidObjectId(id)) {
    return {
      success: false,
      status: 400,
      message: "Invalid id",
    };
  }

  const updated = await Notification.findOneAndUpdate(
    {
      _id: id,
      user: ownerId,
    },
    {
      $set: {
        see: 1,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!updated) {
    return {
      success: false,
      status: 404,
      message: "Notification not found",
    };
  }

  return {
    success: true,
    data: updated,
  };
};

const remove = async (id, ownerId) => {
  if (!isValidObjectId(id)) {
    return {
      success: false,
      status: 400,
      message: "Invalid id",
    };
  }

  const deleted = await Notification.findOneAndDelete({
    _id: id,
    user: ownerId,
  });

  if (!deleted) {
    return {
      success: false,
      status: 404,
      message: "Notification not found",
    };
  }

  return {
    success: true,
  };
};

export { getAll, get, markSeen, remove };

export default {
  getAll,
  get,
  markSeen,
  remove,
};
