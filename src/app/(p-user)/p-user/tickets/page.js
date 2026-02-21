import { authUser } from "@/utils/serverHelper";
import Pagination from "@/components/modules/pageination/pagination";
import TicketModel from "../../../../../model/ticket";
import { paginate } from "@/utils/helper";
import SendTicket from "@/components/template/p-user/tickets/sendTicket";
import Ticket from "@/components/template/p-user/index/ticket";
import connectToDB from "../../../../../configs/db";

const page = async ({ searchParams }) => {
    await connectToDB()
    const user = await authUser()
    
    const paginatedData = await paginate(
        TicketModel,
        searchParams,
        { user: user.id, parent: null },
        "department"
    );

    return (
        <>
            <div>
                <h1 className="title">
                    <span>Tickets</span>
                </h1>
            </div>
            <main className="container">
                {paginatedData.data.length > 0 &&
                    <>
                        <h1 className="title">
                            <span>All Tickets</span>
                        </h1>
                        <div>
                            {paginatedData.data.map((ticket) => (
                                <Ticket
                                    role={user.role}
                                    key={ticket._id}
                                    {...ticket} />
                            ))}
                        </div>
                    </>}

                {paginatedData.data.length === 0 &&
                    <p className="empty">
                        No Ticket Yet :(
                    </p>}
                <Pagination
                    href={`tickets?`}
                    currentPage={paginatedData.page}
                    pageCount={paginatedData.pageCount}
                    limit={paginatedData.limit}
                />
                <SendTicket
                    user={user.id}
                />
            </main>
        </>
    );
};

export default page;
