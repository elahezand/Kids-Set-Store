import styles from "./comments.module.css";
import CommentForm from "../commentForm/commentForm";
import commentModel from "../../../../../model/comment";
import { paginate } from "@/utils/helper";
import CommentsList from "./commentsList";

const Comments = async ({ productId, searchParams }) => {
  const sParams = await searchParams;
  
  const paginatedData = await paginate(
    commentModel,
    sParams,
    {productID:productId},
    null,
    true,
    false
  );
  return (
    <div>
      <p>Comments ({paginatedData.data.filter(comment => comment.isAccept).length})
        :</p>
      <hr />
      <main className={styles.comments}>
        <div className={styles.user_comments}>
          <CommentsList
            nextCursor={paginatedData.nextCursor}
            limit={paginatedData.limit}
            data={JSON.parse(JSON.stringify(paginatedData.data))} />
        </div>
        <div className={styles.form_bg}>
          <CommentForm
            productId={productId} />
        </div>
      </main>
    </div>
  );
};

export default Comments;
