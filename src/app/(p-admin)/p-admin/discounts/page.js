import connectToDB from "../../../../../configs/db";
import DiscountModel from "../../../../../model/discount";
import Table from "@/components/template/p-admin/discounts/table";
import AddDiscount from "@/components/template/p-admin/discounts/addDiscount";
import Pagination from "@/components/modules/pageination/pagination";
import { paginate } from "@/utils/helper";
import ProductModel from "../../../../../model/product";
const Discounts = async ({ searchParams }) => {
    await connectToDB();
    const paginatedData = await paginate(DiscountModel, searchParams, {})
    const products = await ProductModel.find({}).lean()

    return (
            <main>
                <AddDiscount
                    products={JSON.parse(JSON.stringify(products))} />
                {paginatedData.data.length === 0 ? (
                    <p className="empty">  No Discount Yet :(</p>
                ) : (
                    <Table
                        discounts={JSON.parse(JSON.stringify(paginatedData.data))}
                        title=" Discount List"
                    />
                )}
                <Pagination
                    href={`discounts?`}
                    currentPage={paginatedData.page}
                    pageCount={paginatedData.pageCount}
                    limit={paginatedData.limit}
                />
            </main>
    );
};

export default Discounts;
