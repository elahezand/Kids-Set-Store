import styles from "@/styles/p-user/favorites.module.css";
import Product from "@/components/template/p-user/favorites/product"
import Layout from "@/layouts/userPanelLayout";
import Pagination from "@/components/modules/pageination/pagination";
import { pageinatedData } from "@/utils/helper";
import connectToDB from "../../../../db/db";
import { authUser } from "@/utils/serverHelper";
import FavoriteModel from "../../../../model/favorite";
const page = async ({searchParams}) => {
  connectToDB();
  const user = await authUser();
  const wishlist = await FavoriteModel.find({ userID: user._id })
    .populate(
      "productID"
    );


  const param = await searchParams
  const { page } = param
  const [filteredArray, pageCount] = pageinatedData(wishlist, page, 5)

  return (
    <Layout>
        <div>
          <h1 className="title">
            <span>Favorites</span>
          </h1>
        </div>
        <main className={styles.container}
          data-aos="fade-up">
          <section>
            {filteredArray.length > 0 &&
              JSON.parse(JSON.stringify(filteredArray)).map((wish, index) =>
                <Product
                  key={index}
                  id={wish._id}
                  name={wish.productID.name}
                  score={wish.productID.score}
                  price={wish.productID.price}
                  img={wish.productID.img}

                />)}
          </section>
          <Pagination
            pageCount={pageCount}
            href="favorites"
            currentPage={page}
          />
        </main>
        {wishlist.length === 0 && (
          <p className={styles.empty}>NO Item Yet</p>
        )}
    </Layout>
  );
};

export default page;
