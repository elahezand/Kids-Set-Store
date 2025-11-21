"use client";
import React from "react";
import Ticket from "./ticket";
function Tickets({ tickets }) {
  return (
    <main className="container">
      <h1 className="title">
        <span>All Tickets</span>
      </h1>
      <div>
        {tickets.map((ticket) => (
          <Ticket key={ticket._id} {...ticket} />
        ))}
      </div>
      {
        tickets.length === 0 && (
          <div className="empty">
            <p> No Tickets Yet</p>
          </div>
        )
      }
    </main>
  );
}

export default Tickets;
