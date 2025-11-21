import React from 'react'
import TicketModel from '../../../../../model/ticket'
import Layout from '@/layouts/userPanelLayout'
import connectToDB from '../../../../../db/db'
import Link from 'next/link'
import styles from "@/styles/p-user/ticketID.module.css"
import Response from '@/components/template/p-user/ticketID/response'
import Answer from '@/components/template/p-admin/tickets/answer'
export default async function page({ params }) {
    connectToDB()
    const { id } = await params
    const ticket = await TicketModel.findOne({ _id: id }, "-__v")
        .populate("message.senderID", "username role")
        .lean()

    return (
        <Layout>
            <main className="container">
                <div>
                    <h1 className={styles.title}>
                        <span> Test Ticket</span>
                        <Link href="/p-user/tickets"> Send New Ticket</Link>
                    </h1>
                </div>
                <div>
                    <Answer
                        ticket={JSON.parse(JSON.stringify(ticket))} />
                </div>
                <Response ticketID={JSON.parse(JSON.stringify(ticket._id))} />
            </main>
        </Layout>
    )
}


