import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import Image from "next/image";
import type { ProductComment } from "@/types";

const Comment = ({
    user,
    rating,
    createdAt,
    editedAt,
    body,
    pros = [],
    cons = [],
    recommendation,
    verifiedPurchase,
    replies = [],
}: ProductComment) => {
    const username = user?.username || "User";

    const score = Math.min(
        Math.max(Number(rating) || 0, 0),
        5
    );

    const date = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "";

    const editedDate = editedAt
        ? new Date(editedAt).toLocaleDateString()
        : "";

    return (
        <section className="mt-4 border-b border-black/20 pb-6">
            {/* Main comment */}
            <div className="flex items-start gap-4 sm:gap-6">
                <Image
                    width={60}
                    height={60}
                    src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
                    className="h-[50px] w-[50px] shrink-0 rounded-full sm:h-[60px] sm:w-[60px]"
                    alt=""
                />

                <div className="w-full">
                    {/* User + Date + Rating */}
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <strong>{username}</strong>

                            {verifiedPurchase && (
                                <span className="text-xs font-medium text-green-600">
                                    ✓ Verified Purchase
                                </span>
                            )}

                            <span className="text-sm text-sage-400">
                                {date}
                            </span>

                            {editedAt && (
                                <span className="text-xs text-gray-500">
                                    (edited {editedDate})
                                </span>
                            )}
                        </div>

                        {/* Rating */}
                        <div
                            className="flex gap-1 text-coral-300"
                            aria-label={`Rating: ${score} out of 5`}
                        >
                            {Array.from(
                                { length: score },
                                (_, index) => (
                                    <FaStar
                                        key={`full-${index}`}
                                    />
                                )
                            )}

                            {Array.from(
                                { length: 5 - score },
                                (_, index) => (
                                    <FaRegStar
                                        key={`empty-${index}`}
                                    />
                                )
                            )}
                        </div>
                    </div>

                    {/* Comment body */}
                    <p className="mb-4 mt-3">{body}</p>

                    {/* Recommendation */}
                    {recommendation && (
                        <div className="mb-4">
                            {recommendation === "recommended" && (
                                <span className="text-sm font-medium text-green-600">
                                    ✓ I recommend this product
                                </span>
                            )}

                            {recommendation === "not_recommended" && (
                                <span className="text-sm font-medium text-red-500">
                                    ✕ I dont recommend this product
                                </span>
                            )}

                            {recommendation === "no_idea" && (
                                <span className="text-sm text-gray-500">
                                    No recommendation
                                </span>
                            )}
                        </div>
                    )}

                    {/* Pros & Cons */}
                    {(pros.length > 0 || cons.length > 0) && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Pros */}
                            {pros.length > 0 && (
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-green-600">
                                        Pros
                                    </p>

                                    <ul className="space-y-1 text-sm">
                                        {pros.map((pro, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="mt-0.5 text-green-600">
                                                    ✓
                                                </span>

                                                <span>{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Cons */}
                            {cons.length > 0 && (
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-red-500">
                                        Cons
                                    </p>

                                    <ul className="space-y-1 text-sm">
                                        {cons.map((con, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="mt-0.5 text-red-500">
                                                    ✕
                                                </span>

                                                <span>{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="ml-8 mt-5 border-l pl-6 sm:ml-16">
                    {replies.map((reply) => (
                        <Comment
                            key={reply._id}
                            {...reply}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Comment;
