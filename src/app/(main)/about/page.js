import styles from "@/styles/about-us.module.css";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";

export async function generateMetadata() {
    return {
        title: "About Us - Your Company Name",
        description: "Learn more about our story, mission, and values. We are dedicated to delivering high-quality products with a focus on customer satisfaction.",
        openGraph: {
            title: "About Us - Your Company Name",
            description: "Learn more about our story, mission, and values.",
            url: "https://yourdomain.com/about",
            siteName: "Your Company Name",
            images: [
                {
                    url: "https://yourdomain.com/images/about-og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: "About Us",
                },
            ],
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: "About Us - Your Company Name",
            description: "Learn more about our story, mission, and values.",
            images: ["https://yourdomain.com/images/about-og-image.jpg"],
        },
    };
}

const page = async () => {
    return (
        <>
            <Breadcrumb title={"About US."} />
            <div className={styles.container}>
                <div>
                    <span>About Us</span>
                    <h3>Lorem ipsum dolor sit amet, consectetur.</h3>
                    <p>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita mollitia voluptatum maxime, omnis ipsum corporis porro voluptatem doloribus atque aut.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat sequi modi reiciendis incidunt, assumenda obcaecati eius tenetur error possimus sapiente.
                    </p>
                </div>
                <div className={styles.main}>
                    <div>
                        <p>
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore blanditiis, laudantium debitis magni nemo id molestias iste pariatur non deleniti delectus? Dignissimos omnis minus voluptas exercitationem cum molestiae nisi sit voluptatibus? Aspernatur cum, tenetur assumenda sint vel incidunt nam sunt sed, amet veniam distinctio quis voluptate ipsa dolorem reiciendis. Commodi?
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, placeat ducimus. Soluta voluptatum fugit nulla, eligendi a quae, molestias et voluptatem modi inventore officiis. Odio eos quisquam ipsum facilis fugiat!
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nostrum nihil possimus voluptates veniam quae assumenda molestiae quidem dolorem rerum!
                        </p>
                    </div>
                    <div>
                        <span>Set kids</span>
                        <h3>Lorem ipsum dolor sit amet.</h3>
                        <p>
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque repellat voluptate nesciunt ipsam doloribus animi? Aliquam harum doloribus tempore natus?
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa voluptas exercitationem fugiat consequatur qui nobis molestiae debitis repudiandae tenetur laudantium sit, minima officia aperiam odit itaque incidunt praesentium veniam nihil doloribus corrupti. Dolor ipsam accusantium velit ad explicabo, reprehenderit a, nisi sed ab incidunt ducimus voluptas animi expedita et voluptatum.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default page;
