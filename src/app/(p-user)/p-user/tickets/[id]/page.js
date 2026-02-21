import React from "react";
import ticketModel from "../../../../../../model/ticket";
import connectToDB from "../../../../../../configs/db";
import Link from "next/link";
import styles from "@/styles/p-user/ticketID.module.css";
import Response from "@/components/template/p-user/ticketID/response";
import Answer from "@/components/template/p-admin/tickets/answer";

export default async function page({ params }) {
  await connectToDB();

  const { id } = params;
 const ticket = await ticketModel.findById(id)
      .populate("user", "name email")
      .populate("department", "title")
      .lean();

    const children = await ticketModel.find({ parent: ticket._id })
      .populate("user", "name email role")
      .lean();

    ticket.children = children;

  return (
    <main className="container">
      <div>
        <h1 className={styles.title}>
          <span>Test Ticket</span>
          <Link href="/p-user/tickets">Send New Ticket</Link>
        </h1>
      </div>

      <Answer ticket={JSON.parse(JSON.stringify(ticket))} />
      <Response
        ticketID={JSON.parse(JSON.stringify(id))}
      />
    </main>
  );
}
