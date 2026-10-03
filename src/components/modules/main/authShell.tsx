import Image from "next/image";
import type { ReactNode } from "react";

interface AuthShellProps {
  image?: string;
  alt?: string;
  children: ReactNode;
}

const AuthShell = ({ image, alt = "", children }: AuthShellProps) => {
  return (
    <div className="page-container">
      <div className="auth-shell">
        <div className="p-6 py-10 sm:p-10 md:py-14">{children}</div>
        {image && (
          <div className="hidden h-full min-h-[420px] w-full border-sage-400 md:block md:border-s-2">
            <Image width={700} height={800} src={image} alt={alt} className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthShell;
