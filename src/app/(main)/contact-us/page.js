import Breadcrumb from "@/components/modules/main/breadCrumb";
import Form from "@/components/template/main/form/Form";
import Map from "@/components/template/main/form/map";
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
        images: [{ url: "https://yourwebsite.com/images/contact-og.jpg", width: 1200, height: 630, alt: "Contact Set kids" }],
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
        <div className="page-container text-text dark:text-gray-100">
            <Breadcrumb route="Contact-Us" title="ContactUs" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                <div className="flex flex-col items-center justify-center gap-6">
                    <Image
                        width={200}
                        height={200}
                        alt="Slide"
                        priority
                        sizes="100vw"
                        fetchPriority="high"
                        src="/images/59aa50c82c33be2762280e2c0939bde3.jpg"
                        className="h-[140px] w-full object-contain sm:h-[180px]"
                    />
                    <Form />
                </div>
                <div className="h-[350px] overflow-hidden rounded-2xl shadow-card sm:h-[450px] md:h-full">
                    <Map />
                </div>
            </div>
        </div>
    );
};

export default page;
