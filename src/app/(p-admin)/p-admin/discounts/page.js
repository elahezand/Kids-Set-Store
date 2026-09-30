import connectToDB from "@/configs/db";
import DiscountModel from "@/model/coupon";
import ProductModel from "@/model/product";
import { paginatePage } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import AddDiscount from "@/components/template/p-admin/discounts/addDiscount";
import DiscountsTable from "@/components/template/p-admin/discounts/table";

export default async function DiscountsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const [paginatedData, products] = await Promise.all([
        paginatePage(DiscountModel, params, {}),
        ProductModel.find({}).select("name").lean(),
    ]);

    return (
        <>
            <PageHeader title="Discounts" description="Create discount codes and track their usage." />
            <AddDiscount products={JSON.parse(JSON.stringify(products))} />
            <DiscountsTable discounts={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
