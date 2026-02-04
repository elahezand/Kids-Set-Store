import React from "react";
import Layout from "@/layouts/adminPanelLayout";
import connectToDB from "../../../../../configs/db";
import commentModel from "../../../../../model/comment";
import Table from "@/components/template/p-admin/comments/table"
import Pagination from "@/components/modules/pageination/pagination";
import { paginate } from "@/utils/helper";

const page = async ({ searchParams }) => {
  await connectToDB();
  const paginatedData = await paginate(commentModel, searchParams, {}, "productID")

  return (
    <Layout>
      <main>
        {paginatedData.data.length === 0 ? (
          <p className="empty">No Comment Yet :( </p>
        ) : (
          <Table
            comments={JSON.parse(JSON.stringify(paginatedData.data))}
            title="Comment List"
          />
        )}
        <Pagination
          href={`comments?`}
          currentPage={paginatedData.page}
          pageCount={paginatedData.pageCount}
          limit={paginatedData.limit}
        />
      </main>
    </Layout>
  );
};

export default page;
