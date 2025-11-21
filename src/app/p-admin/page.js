import styles from "@/styles/p-admin/index.module.css";
import connectToDB from "../../../db/db";
import UserModal from "../../../model/user";
import ProductModal from "../../../model/product";
import TicketModel from "../../../model/ticket";
import Layout from "@/layouts/adminPanelLayout";
import Box from "@/components/modules/box/box";
import Chart from "@/components/template/p-admin/index/chart";

async function Page() {
    connectToDB();
    const tickets = await TicketModel.find({}).lean();
    const users = await UserModal.find({}).lean();
    const products = await ProductModal.find({}).lean();

    return (
        <Layout>
            <main>
                <section className={styles.dashboard_contents}>
                    <Box title="ALL Tickets" value={tickets.length} />
                    <Box title="ALL Products" value={products.length} />
                    <Box title=" ALL Orders" value="333" />
                    <Box title="ALL orders" value={users.length} />
                </section>{" "}
                <div className={styles.dashboard_charts}>
                    <section>
                        <p> Sales Data</p>
                        <Chart type="LineChart" />
                    </section>
                    <section>
                        <p> Growth Rate</p>
                        <Chart type="AreaChart" />
                    </section>
                </div>
            </main>
        </Layout>
    );
}

export default Page;
