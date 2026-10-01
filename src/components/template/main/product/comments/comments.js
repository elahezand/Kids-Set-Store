import Link from "next/link";
import CommentForm from "@/components/template/main/product/commentForm";
import CommentsList from "@/components/template/main/product/comments/commentsList";
import commentService from "@/services/public/comment";
import { toPlain } from "@/utils/format";

const PAGE_SIZE = 5;

/* First page is rendered on the server with the same service as
   GET /api/comments/product/:product; "Load more" calls that route. */
const Comments = async ({ productId, total = 0, isLoggedIn = false }) => {
    const result = await commentService.getByProduct(productId, {
        limit: PAGE_SIZE,
    });

    const data = result.success ? toPlain(result.data) : [];

    return (
        <div>
            <h2 className="section-title mb-6">Reviews ({total})</h2>

            <div className="flex flex-col gap-10 md:flex-row">
                <div className="w-full md:w-1/2">
                    {data.length ? (
                        <CommentsList
                            productId={productId}
                            data={data}
                            nextCursor={result.pagination?.nextCursor ?? null}
                            limit={PAGE_SIZE}
                        />
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                            No reviews yet. Be the first to review this product.
                        </p>
                    )}
                </div>

                <div className="w-full md:w-1/2">
                    {isLoggedIn ? (
                        <CommentForm productId={productId} />
                    ) : (
                        <div className="card card-body text-center">
                            <p className="mb-4 text-text dark:text-gray-100">
                                Log in to write a review.
                            </p>
                            <Link href="/login-register" className="btn btn-primary mx-auto w-max">
                                Log in / Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comments;
