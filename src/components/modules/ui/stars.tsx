import { FaRegStar, FaStar } from "react-icons/fa";

interface StarsProps {
  score?: number;
  max?: number;
  className?: string;
}

export default function Stars({ score = 0, max = 5, className = "" }: StarsProps) {
  const value = Math.max(0, Math.min(max, Math.round(Number(score) || 0)));

  return (
    <span
      role="img"
      className={`inline-flex items-center gap-0.5 text-coral-300 ${className}`}
      aria-label={`Rated ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (i < value ? <FaStar key={i} /> : <FaRegStar key={i} />))}
    </span>
  );
}
