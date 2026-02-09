import React from "react";
import Table from "@/components/template/p-admin/users/table"
import connectToDB from "../../../../../configs/db";
import UserModel from "../../../../../model/user";
import { paginate } from "@/utils/helper";
import Pagination from "@/components/modules/pageination/pagination";
const page = async ({ searchParams }) => {
    await connectToDB()
    const paginatedData = await paginate(UserModel, searchParams)

    return (
        <main>
            {paginatedData.data.length === 0 ? (
                <p className={styles.empty}>No User Yet :(</p>
            ) : (
                <Table
                    users={JSON.parse(JSON.stringify(paginatedData.data))}
                    title="User List"
                />
            )}
            <Pagination
                href={`users?`}
                currentPage={paginatedData.page}
                pageCount={paginatedData.pageCount}
                limit={paginatedData.limit} />
        </main>
    );
};

export default page;
