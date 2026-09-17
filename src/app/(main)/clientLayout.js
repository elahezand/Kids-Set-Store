import Banner from "@/components/modules/main/banner";
import ShowFooter from "./showFooter";
import Navbar from "@/components/modules/main/navbar/navbar";
export default function ClientLayout({children}) {

    return (
        <>
            <Navbar />
            <Banner />
            {children}
            <ShowFooter />
        </>
    );
}
