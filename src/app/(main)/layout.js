import ClientLayout from "@/app/(main)/clientLayout";
import AosInit from "@/components/modules/ui/aosInit";

/* Main site shell. The cart is server side (services/user/cart), no client cart context. */
export default function MainLayout({ children }) {
    return (
        <>
            <AosInit />
            <ClientLayout>{children}</ClientLayout>
        </>
    );
}
