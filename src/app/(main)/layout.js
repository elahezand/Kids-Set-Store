import { CartProvider } from "@/utils/context/cartProvider";
import ClientLayout from "@/app/(main)/clientLayout";

export default function clientLayout({ children }) {
    return (
        <ClientLayout>
            <CartProvider>
                {children}
            </CartProvider>
        </ClientLayout>
    );
}

