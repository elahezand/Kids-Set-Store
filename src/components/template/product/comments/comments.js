import styles from "./comments.module.css";
import CommentForm from "../commentForm/commentForm";
import Comment from "@/components/modules/comment/comment";
import Link from "next/link";
import { getMe } from "@/utils/serverHelper";
import CommentsList from "./commentsList";

const Comments = async ({ productId, searchParams }) => {
  const user = await getMe()
  const { id } = await params
  const searchparams = await searchParams

  const paginatedData = await paginate(
    commentModel,               // Model
    searchparams,               // searchParams
    { product: id }, // filter
    null,                       // populate
    true,
    false                  // cursor /page
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
            user={user._id}
            productId={productId} />
        </div>
      </main>
    </div>
  );
};

export default Comments;
