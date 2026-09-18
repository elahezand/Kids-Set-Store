import CommentForm from "../commentForm";
import commentModel from "../../../../../../model/comment";
import { paginate } from "@/utils/paginate";
import CommentsList from "./commentsList";

const Comments = async ({ productId, searchParams }) => {
  const sParams = await searchParams;
  const paginatedData = await paginate(
    commentModel,
    sParams,
    { productID: productId, isAccept: true },
    null,
    true,
    false
  );

  const paginatedDatSerialize = JSON.parse(JSON.stringify(paginatedData.data))
  return (
    <div>
      <h2 className="section-title mb-6">Comments ({paginatedData.data.length})</h2>
      <main className="flex flex-col gap-10 md:flex-row">
        <div className="w-full md:w-1/2">
          <CommentsList
            productId={productId}
            nextCursor={paginatedData.nextCursor}
            limit={paginatedData.limit}
            data={paginatedDatSerialize}
          />
        </div>
        <div className="w-full md:w-1/2">
          <CommentForm productId={productId} />
        </div>
      </main>
    </div>
  );
};

export default Comments;
