import styles from "./comments.module.css";
import CommentForm from "../commentForm/commentForm";
import Comment from "@/components/modules/comment/comment";

const Comments = ({ product }) => {
  return (
    <div>
      <p>Comments ({product.comments.filter(comment => comment.isAccept).length}) :</p>
      <hr />
      <main className={styles.comments}>
        <div className={styles.user_comments}>
          <div>
            {product.comments.filter(comment => comment.isAccept).map((comment, index) => (
              <Comment key={index + 1} {...comment} />
            ))}
          </div>
        </div>
        <div className={styles.form_bg}>
          <CommentForm
            productID={product._id}
            userID={product.comments[0]?.userID} />
        </div>
      </main>
    </div>
  );
};

export default Comments;
