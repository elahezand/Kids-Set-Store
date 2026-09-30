import CommentForm from "@/components/template/main/product/commentForm";
import CommentsList from "@/components/template/main/product/comments/commentsList";
import commentService from "@/services/public/comment";
const Comments = async ({ productId }) => {
    const result = await commentService.getByProduct(productId, {
        limit: 5,
    });

    const data = JSON.parse(JSON.stringify(result.data));
    return (
        <div>
            <h2 className="section-title mb-6">
                Comments ({data.length})
            </h2>

            <main className="flex flex-col gap-10 md:flex-row">
                <div className="w-full md:w-1/2">
                    <CommentsList
                        productId={productId}
                        nextCursor={result.pagination.nextCursor}
                        limit={result.pagination.limit}
                        data={data}
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