import styles from "@/styles/p-user/favorites.module.css";
import Product from "@/components/template/p-user/favorites/product"
import FavoriteModel from "../../../../../model/favorite";
import Pagination from "@/components/modules/pageination/pagination";
import { paginate } from "@/utils/helper";
import connectToDB from "../../../../../configs/db";
import ProductModel from "../../../../../model/product";
import { authUser } from "@/utils/serverHelper";
const page = async ({ searchParams }) => {
  await connectToDB()
  const user = await authUser()
  if (!user) redirect("/login-register")

  const searchparams = searchParams
  const wishlist = await FavoriteModel.findOne({ user: user.id })
  if (!wishlist) return null

  const paginatedData = await paginate(
    ProductModel,
    searchparams,
    { _id: { $in: wishlist.products } }
  )
  
  return (
    <>
      <div>
        <h1 className="title">
          <span>Favorites</span>
        </h1>
      </div>
      <main className={styles.container}
        data-aos="fade-up">
        <section>
          {paginatedData.data.length > 0 &&
            JSON.parse(JSON.stringify(paginatedData.data)).map((wish, index) =>
              <Product
                key={index}
                id={wish._id}
                name={wish.name}
                score={wish.score}
                price={wish.price}
                img={wish.img}

              />)}
        </section>
        <Pagination
          href={`favorites?`}
          currentPage={paginatedData.page}
          pageCount={paginatedData.pageCount}
          limit={paginatedData.limit}
        />
      </main>
      {paginatedData.data.length === 0 && (
        <p className={styles.empty}>NO Item Yet</p>
      )}
    </>
  );
};

export default page;
