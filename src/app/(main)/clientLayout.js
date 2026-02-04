import Banner from "@/components/template/index/banner/banner";
import ShowFooter from "./showFooter";
import Navbar from "@/components/modules/navbar/navbar";

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
