import styles from "@/styles/about-us.module.css";
import Navbar from "@/components/modules/navbar/navbar";
import Banner from "@/components/template/index/banner/banner";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import Footer from "@/components/modules/footer/footer";

const page = async () => {
    return (
        <>
            <Navbar />
            <Banner />
            <Breadcrumb title={
                "About US."} />
            <div className={styles.container}>
                <section>
                    <div>
                        <span>About Us</span>
                        <p>Lorem ipsum dolor sit amet, consectetur.</p>
                    </div>
                    <p>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita mollitia voluptatum maxime, omnis ipsum corporis porro voluptatem doloribus atque aut.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat sequi modi reiciendis incidunt, assumenda obcaecati eius tenetur error possimus sapiente.
                    </p>
                </section>
                <main className={styles.main}>
                    <div>
                        <p>
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore blanditiis, laudantium debitis magni nemo id molestias iste pariatur non deleniti delectus? Dignissimos omnis minus voluptas exercitationem cum molestiae nisi sit voluptatibus? Aspernatur cum, tenetur assumenda sint vel incidunt nam sunt sed, amet veniam distinctio quis voluptate ipsa dolorem reiciendis. Commodi?
                        </p>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, placeat ducimus. Soluta voluptatum fugit nulla, eligendi a quae, molestias et voluptatem modi inventore officiis. Odio eos quisquam ipsum facilis fugiat!
                        </p>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nostrum nihil possimus voluptates veniam quae assumenda molestiae quidem dolorem rerum!
                        </p>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, vitae.</p>
                    </div>
                    <div>
                        <span>Set kids</span>
                        <h2>Lorem ipsum dolor sit amet.</h2>
                        <p>
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque repellat voluptate nesciunt ipsam doloribus animi? Aliquam harum doloribus tempore natus?
                        </p>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa voluptas exercitationem fugiat consequatur qui nobis molestiae debitis repudiandae tenetur laudantium sit, minima officia aperiam odit itaque incidunt praesentium veniam nihil doloribus corrupti. Dolor ipsam accusantium velit ad explicabo, reprehenderit a, nisi sed ab incidunt ducimus voluptas animi expedita et voluptatum.
                        </p>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default page;
