import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import styles from "@/styles/contact-us.module.css";
import Form from "@/components/template/contactUs/form/Form";
import Map from "@/components/template/contactUs/form/map";
import Image from "next/image";

export const metadata = {
    title: "Contact Us - SET KIDS",
    description: "Get in touch with Set KIDS. Reach out for questions, feedback, or support. We'd love to hear from you!",
    keywords: ["Set Kids", "Contact", "Support", "Feedback", "Customer Service"],
    authors: [{ name: "SET KIDS Team" }],
    openGraph: {
        title: "Contact Us - SET KIDS",
        description: "Get in touch with SET KIDS. Reach out for questions, feedback, or support.",
        url: "https://yourwebsite.com/contact",
        siteName: "Set kids",
        images: [
            {
                url: "https://yourwebsite.com/images/contact-og.jpg",
                width: 1200,
                height: 630,
                alt: "Contact Set kids",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Us - Set Kids",
        description: "Get in touch with Set Kids. Reach out for questions, feedback, or support.",
        images: ["https://yourwebsite.com/images/contact-og.jpg"],
    },
};
const page = async () => {

    return (
        <>
            <Breadcrumb
                route={"Contact-Us"}
                title={"ContactUs"} />
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
        </>
    );
};

export default page;
