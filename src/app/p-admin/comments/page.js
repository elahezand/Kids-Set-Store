import React from "react";
import Layout from "@/layouts/adminPanelLayout";
import connectToDB from "../../../../db/db";
import commentModel from "../../../../model/comment";
import Table from "@/components/template/p-admin/comments/table"
import Pagination from "@/components/modules/pageination/pagination";
import { pageinatedData } from "@/utils/helper";

const page = async ({ searchParams }) => {
  connectToDB();
  const comments = await commentModel.find({})
    .sort({ _id: -1 })
    .populate("productID")
    .lean();

  const param = await searchParams
  const { page } = param

  const [filteredArray, pageCount] = pageinatedData(comments, page, 10)

  return (
    <Layout>
      <main>
        {comments.length === 0 ? (
          <p className="empty">No Comment Yet :( </p>
        ) : (
          <Table
            comments={JSON.parse(JSON.stringify(filteredArray))}
            title="Comment List"
          />
        )}
        <Pagination
          pageCount={pageCount}
          href="comments?"
          currentPage={page}
        />
      </main>
    </Layout>
  );
};

export default page;
