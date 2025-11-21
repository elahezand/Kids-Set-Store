import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import Navbar from "@/components/modules/navbar/navbar";
import Footer from "@/components/modules/footer/footer";
import styles from "@/styles/rules.module.css";
import Image from "next/image";

const page = async () => {

    return (
        <>
            <Navbar />
            <Breadcrumb route={"rules"} title={"Rules"} />
            <div className={styles.container_rules}>
                <Image
                    width={600}
                    height={600}
                    alt=""
                    src={"/images/c9da3b64fef2bc7cccf83bf5b420afdc.jpg"}
                />
                <div className={styles.container} data-aos="fade-up">
                    <p>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Reprehenderit, hic obcaecati alias nam officiis provident expedita laboriosam id voluptas itaque consequuntur error unde sunt quidem blanditiis mollitia cumque tempora iure nisi eligendi dignissimos porro illum atque nostrum! Ducimus amet suscipit repellendus iure itaque aut nulla. Quisquam, sapiente. Consectetur, officia mollitia incidunt in, libero assumenda eveniet ullam magni ad impedit ipsam aspernatur enim ut, laudantium suscipit aliquam quae. Debitis ullam dolor fugit eum, praesentium beatae sed recusandae minima nostrum deleniti doloremque magnam sint quidem, facilis in facere nemo officia numquam hic, at atque voluptatum veritatis quaerat laboriosam! Repellendus sed sit vel!
                    </p>
                    <p>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo illum ab, sit laborum veniam fuga neque ipsam earum placeat dolor quae eius enim voluptates eligendi dolore nihil ipsum repellat, accusantium dolorum. Aliquam ex sed sequi ullam doloremque nemo nihil hic, consectetur soluta dolores, modi iusto facere. Voluptatum eos consequatur ipsa quas ad, quia necessitatibus nesciunt accusamus minima ratione eius provident asperiores dolorem eveniet vitae aut et commodi modi ullam odit sed ducimus numquam optio totam? Praesentium tempora illum asperiores est, maiores repellendus quod quasi culpa et, accusantium exercitationem. Explicabo velit at omnis pariatur rerum repudiandae fuga iure repellat dolorem nihil asperiores ipsa facere suscipit, magnam quae! Fugiat quam saepe voluptate nisi ullam tenetur amet porro modi corrupti aperiam! Voluptatibus, excepturi?
                        <strong>
                            Response During Business Hours
                        </strong>
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, eaque?</p>
                    <p>
                        If You Have Any Questions ,Please Contact  Us Using The Information Below :
                    </p>
                    <p>Contact Phone And Fax : +1(940) 3001175</p>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default page;
