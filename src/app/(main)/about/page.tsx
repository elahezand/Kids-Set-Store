import Breadcrumb from "@/components/modules/main/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | SET KIDS",
  description: "Our story, mission and values.",
  openGraph: {
    title: "About Us | SET KIDS",
    description: "Our story, mission and values.",
    type: "website",
  },
};

const page = async () => {
  return (
    <div className="page-container text-text dark:text-gray-100">
      <Breadcrumb route="about" title="About Us" />
      <div>
        <div>
          <span className="text-sm font-semibold text-coral-400">About Us</span>
          <h3 className="my-2.5 text-2xl font-bold sm:text-3xl">Lorem ipsum dolor sit amet, consectetur.</h3>
          <p className="leading-8 text-gray-700 dark:text-gray-300">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita mollitia voluptatum maxime, omnis ipsum
            corporis porro voluptatem doloribus atque aut. Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Fugiat sequi modi reiciendis incidunt, assumenda obcaecati eius tenetur error possimus sapiente.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:mt-14 md:grid-cols-2 md:gap-12 lg:mt-16">
          <div>
            <p className="leading-8 text-gray-700 dark:text-gray-300">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore blanditiis, laudantium debitis magni nemo
              id molestias iste pariatur non deleniti delectus? Dignissimos omnis minus voluptas exercitationem cum
              molestiae nisi sit voluptatibus? Aspernatur cum, tenetur assumenda sint vel incidunt nam sunt sed, amet
              veniam distinctio quis voluptate ipsa dolorem reiciendis. Commodi? Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Impedit, placeat ducimus. Soluta voluptatum fugit nulla, eligendi a quae, molestias et
              voluptatem modi inventore officiis. Odio eos quisquam ipsum facilis fugiat! Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Suscipit nostrum nihil possimus voluptates veniam quae assumenda molestiae
              quidem dolorem rerum!
            </p>
          </div>
          <div className="rounded-2xl bg-coral-300 p-6 text-white shadow-card sm:p-10">
            <span className="text-sm font-semibold text-white/85">Set kids</span>
            <h3 className="my-2.5 text-2xl font-bold sm:text-3xl">Lorem ipsum dolor sit amet.</h3>
            <p className="mt-4 leading-8">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque repellat voluptate nesciunt ipsam
              doloribus animi? Aliquam harum doloribus tempore natus? Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Ipsa voluptas exercitationem fugiat consequatur qui nobis molestiae debitis repudiandae tenetur
              laudantium sit, minima officia aperiam odit itaque incidunt praesentium veniam nihil doloribus corrupti.
              Dolor ipsam accusantium velit ad explicabo, reprehenderit a, nisi sed ab incidunt ducimus voluptas animi
              expedita et voluptatum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
