import Breadcrumb from "@/components/modules/main/breadCrumb";
import Image from "next/image";

const page = async () => {
    return (
        <div className="page-container">
            <Breadcrumb route="rules" title="Rules" />
            <div className="grid grid-cols-1 justify-between gap-8 text-text dark:text-gray-100 md:grid-cols-[40%_1fr]">
                <Image
                    width={600}
                    height={600}
                    alt=""
                    src="/images/c9da3b64fef2bc7cccf83bf5b420afdc.jpg"
                    className="h-[260px] w-full rounded-2xl object-cover shadow-card sm:h-[380px] md:h-full"
                />
                <div data-aos="fade-up">
                    <p className="mb-0 text-justify leading-7">
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Reprehenderit, hic obcaecati alias nam officiis provident expedita laboriosam id voluptas itaque consequuntur error unde sunt quidem blanditiis mollitia cumque tempora iure nisi eligendi dignissimos porro illum atque nostrum! Ducimus amet suscipit repellendus iure itaque aut nulla. Quisquam, sapiente. Consectetur, officia mollitia incidunt in, libero assumenda eveniet ullam magni ad impedit ipsam aspernatur enim ut, laudantium suscipit aliquam quae. Debitis ullam dolor fugit eum, praesentium beatae sed recusandae minima nostrum deleniti doloremque magnam sint quidem, facilis in facere nemo officia numquam hic, at atque voluptatum veritatis quaerat laboriosam! Repellendus sed sit vel!
                    </p>
                    <p className="mb-5 text-justify leading-7">
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo illum ab, sit laborum veniam fuga neque ipsam earum placeat dolor quae eius enim voluptates eligendi dolore nihil ipsum repellat, accusantium dolorum. Aliquam ex sed sequi ullam doloremque nemo nihil hic, consectetur soluta dolores, modi iusto facere. Voluptatum eos consequatur ipsa quas ad, quia necessitatibus nesciunt accusamus minima ratione eius provident asperiores dolorem eveniet vitae aut et commodi modi ullam odit sed ducimus numquam optio totam? Praesentium tempora illum asperiores est, maiores repellendus quod quasi culpa et, accusantium exercitationem. Explicabo velit at omnis pariatur rerum repudiandae fuga iure repellat dolorem nihil asperiores ipsa facere suscipit, magnam quae! Fugiat quam saepe voluptate nisi ullam tenetur amet porro modi corrupti aperiam! Voluptatibus, excepturi?
                        <strong className="mt-2 block">Response During Business Hours</strong>
                    </p>
                    <p className="mb-5 text-justify leading-7">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, eaque?</p>
                    <p className="mb-5 text-justify leading-7">If You Have Any Questions ,Please Contact Us Using The Information Below :</p>
                    <p className="mb-5 text-justify leading-7">Contact Phone And Fax : +1(940) 3001175</p>
                </div>
            </div>
        </div>
    );
};

export default page;
