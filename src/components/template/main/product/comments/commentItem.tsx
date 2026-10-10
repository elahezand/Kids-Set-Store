import Image from "next/image";
import Stars from "@/components/modules/ui/stars";
import { DEFAULT_AVATAR } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import type { ProductComment, Recommendation } from "@/types";

const RECOMMENDATION: Record<Recommendation, { text: string; className: string }> = {
  recommended: { text: "✓ I recommend this product", className: "font-medium text-green-600" },
  not_recommended: { text: "✕ I don't recommend this product", className: "font-medium text-red-500" },
  no_idea: { text: "No recommendation", className: "text-gray-500" },
};

function PointList({ title, items, mark, color }: { title: string; items: string[]; mark: string; color: string }) {
  if (!items.length) return null;

  return (
    <div>
      <p className={`mb-2 text-sm font-semibold ${color}`}>{title}</p>
      <ul className="space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`mt-0.5 ${color}`}>{mark}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CommentItem({
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
}: ProductComment) {
  const recommendationInfo = recommendation ? RECOMMENDATION[recommendation] : null;

  return (
    <section className="mt-4 border-b border-black/20 pb-6 dark:border-white/10">
      <div className="flex items-start gap-4 sm:gap-6">
        <Image
          width={60}
          height={60}
          src={DEFAULT_AVATAR}
          alt=""
          className="h-[50px] w-[50px] shrink-0 rounded-full sm:h-[60px] sm:w-[60px]"
        />

        <div className="w-full">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{user?.username || "User"}</strong>
              {verifiedPurchase && <span className="text-xs font-medium text-green-600">✓ Verified Purchase</span>}
              <span className="text-sm text-brand-600">{formatDate(createdAt)}</span>
              {editedAt && <span className="text-xs text-gray-500">(edited {formatDate(editedAt)})</span>}
            </div>
            <Stars score={rating ?? 0} className="gap-1" />
          </div>

          <p className="mt-3 mb-4">{body}</p>

          {recommendationInfo && (
            <p className={`mb-4 text-sm ${recommendationInfo.className}`}>{recommendationInfo.text}</p>
          )}

          {(pros.length > 0 || cons.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <PointList title="Pros" items={pros} mark="✓" color="text-green-600" />
              <PointList title="Cons" items={cons} mark="✕" color="text-red-500" />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-5 ml-8 border-l pl-6 sm:ml-16">
          {replies.map((reply) => (
            <CommentItem key={String(reply._id)} {...reply} />
          ))}
        </div>
      )}
    </section>
  );
}
