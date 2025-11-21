import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import styles from "@/styles/contact-us.module.css";
import Navbar from "@/components/modules/navbar/navbar";
import Footer from "@/components/modules/footer/footer";
import Form from "@/components/template/contactUs/form/Form";
import Map from "@/components/template/contactUs/form/map";
import Image from "next/image";
const page = async () => {

    return (
        <>
            <Navbar />
            <Breadcrumb route={"Contact-Us"} title={"ContactUs"} />
            <div className={styles.container}>
                <div className={styles.contents}>
                    <Image
                        width={200}
                        height={200}
                        alt="Slide"
                        priority
                        sizes="100vw"
                        fetchPriority="high"
                        src={"/images/59aa50c82c33be2762280e2c0939bde3.jpg"}
                    />
                    <Form />
                </div>
                <div>
                    <Map />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default page;
