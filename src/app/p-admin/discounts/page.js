import connectToDB from "../../../../db/db";
import DiscountModel from "../../../../model/discount";
import Layout from "@/layouts/adminPanelLayout";
import Table from "@/components/template/p-admin/discounts/table";
import AddDiscount from "@/components/template/p-admin/discounts/addDiscount";
import ProductModal from "../../../../model/product";
import { pageinatedData } from "@/utils/helper";
import Pagination from "@/components/modules/pageination/pagination";
const Discounts = async ({searchParams}) => {
    connectToDB();
    const discounts = await DiscountModel.find({}).lean();
    const products = await ProductModal.find({}).lean()

    const param = await searchParams
    const { page } = param

    const [filteredArray, pageCount] = pageinatedData(discounts, page, 10)

    return (
        <Layout>
            <main>
                <AddDiscount
                    products={JSON.parse(JSON.stringify(products))} />
                {discounts.length === 0 ? (
                    <p className="empty">  No Discount Yet :(</p>
                ) : (
                    <Table
                        discounts={JSON.parse(JSON.stringify(filteredArray))}
                        title=" Discount List"
                    />
                )}
                <Pagination
                    pageCount={pageCount}
                    href="discounts?"
                    currentPage={page}
                />
            </main>
        </Layout>
    );
};

export default Discounts;
