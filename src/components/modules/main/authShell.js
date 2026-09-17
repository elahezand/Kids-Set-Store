import Image from "next/image";

/**
 * Shared shell for the auth-style pages (login/register, forgot password).
 * Both pages used to hand-roll the same split card (form on one side, a
 * photo on the other) with slightly different classes — this is the single
 * definition so they always match.
 */
const AuthShell = ({ image, alt = "", children }) => {
  return (
    <div className="page-container">
      <div className="auth-shell">
        <div className="p-6 py-10 sm:p-10 md:py-14">{children}</div>
        {image && (
          <div className="hidden h-full min-h-[420px] w-full border-sage-400 md:block md:border-s-2">
            <Image
              width={700}
              height={800}
              src={image}
              alt={alt}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthShell;
