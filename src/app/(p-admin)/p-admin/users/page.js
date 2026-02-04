import React from "react";
import Table from "@/components/template/p-admin/users/table"
import Layout from "@/layouts/adminPanelLayout";
import connectToDB from "../../../../db/db";
import UserModal from "../../../../model/user";
import { pageinatedData } from "@/utils/helper";
import Pagination from "@/components/modules/pageination/pagination";
const page = async ({ searchParams }) => {
    connectToDB();
    const users = await UserModal.find({}).lean();

    const param = await searchParams
    const { page } = param
    const [filteredArray, pageCount] = pageinatedData(users, page, 5)

    return (
        <Layout>
            <main>
                {users.length === 0 ? (
                    <p className={styles.empty}>No User Yet :(</p>
                ) : (
                    <Table
                        users={JSON.parse(JSON.stringify(filteredArray))}
                        title="User List"
                    />
                )}
                <Pagination
                    pageCount={pageCount}
                    href="users?"
                    currentPage={page}
                />
            </main>
        </Layout>
    );
};

export default page;
