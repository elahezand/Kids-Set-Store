import React from "react";
import connectToDB from "../../../../db/db";
import TicketModel from "../../../../model/ticket";
import Table from "@/components/template/p-admin/tickets/table"
import Layout from "@/layouts/adminPanelLayout";
import Pagination from "@/components/modules/pageination/pagination";
import { pageinatedData } from "@/utils/helper";
const page = async ({ searchParams }) => {
    connectToDB();
    const tickets = await TicketModel.find({})
        .sort({ _id: -1 })
        .populate("message.senderID", "username")
        .populate("department", "title")
        .lean();

    const param = await searchParams
    const { page } = param
    const [filteredArray, pageCount] = pageinatedData(tickets, page, 5)

    return (
        <Layout>
            <main>
                {tickets.length === 0 ? (
                    <p className={styles.empty}>No Ticket Yet :(</p>
                ) : (
                    <Table
                        tickets={JSON.parse(JSON.stringify(filteredArray))}
                        title="Ticket List"
                    />
                )}
                <Pagination
                    pageCount={pageCount}
                    href="tickets?"
                    currentPage={page}
                />
            </main>
        </Layout>
    );
};

export default page;
