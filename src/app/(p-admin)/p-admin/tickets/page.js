import React from "react";
import connectToDB from "../../../../../configs/db";
import TicketModel from "../../../../../model/ticket";
import Table from "@/components/template/p-admin/tickets/table"
import Pagination from "@/components/modules/pageination/pagination";
import { paginate } from "@/utils/helper";
const page = async ({ searchParams }) => {
    await connectToDB()
    const paginatedData = await paginate(TicketModel, searchParams, {}, "department")

    return (
        <main>
            {paginatedData.data.length === 0 ? (
                <p className={styles.empty}>No Ticket Yet :(</p>
            ) : (
                <Table
                    tickets={JSON.parse(JSON.stringify(paginatedData.data))}
                    title="Ticket List"
                />
            )}
            <Pagination
                href={`tikets?`}
                currentPage={paginatedData.page}
                pageCount={paginatedData.pageCount}
                limit={paginatedData.limit} />
        </main>
    );
};

export default page;
