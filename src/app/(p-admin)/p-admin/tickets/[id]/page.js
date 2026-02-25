import React from 'react'
import connectToDB from '../../../../../../configs/db'
import Answer from '@/components/template/p-admin/tickets/answer'
import Response from '@/components/template/p-user/ticketID/response'
import ticketModel from '../../../../../../model/ticket'

export default async function page({ params }) {
    connectToDB()

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
            <h1 className="title">
                <span>Ticket</span>
            </h1>
            <Answer ticket={JSON.parse(JSON.stringify(ticket))} />
            <Response
                ticketID={JSON.parse(JSON.stringify(id))}
            />
        </main>
    )
}

