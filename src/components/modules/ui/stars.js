import { FaRegStar, FaStar } from "react-icons/fa";

export default function Stars({ score = 0, max = 5, className = "" }) {
    const value = Math.max(0, Math.min(max, Number(score) || 0));
    return (
        <span className={`inline-flex items-center gap-0.5 text-coral-300 ${className}`} aria-label={`${value} of ${max}`}>
            {Array.from({ length: max }, (_, i) => (i < value ? <FaStar key={i} /> : <FaRegStar key={i} />))}
        </span>
    );
}
