import React from 'react'
import TicketModel from '../../../../../model/ticket'
import Layout from '@/layouts/adminPanelLayout'
import connectToDB from '../../../../../db/db'
import Answer from '@/components/template/p-admin/tickets/answer'
import Response from '@/components/template/p-user/ticketID/response'

export default async function page({ params }) {
    connectToDB()
    const { id } = await params
    const ticket = await TicketModel.findOne({ _id: id }, "-__v")
        .populate("message.senderID", "username role")
        .lean()

    return (
        <Layout>
            <main className="container">
                <h1 className="title">
                    <span>Ticket</span>
                </h1>
                <div>
                    <Answer
                        ticket={JSON.parse(JSON.stringify(ticket))} />
                </div>
                <Response ticketID={JSON.parse(JSON.stringify(ticket._id))} />
            </main>
        </Layout>
    )
}


