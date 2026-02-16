import { authUser } from "@/utils/serverHelper";
import Pagination from "@/components/modules/pageination/pagination";
import TicketModel from "../../../../../model/ticket";
import { paginate } from "@/utils/helper";
import SendTicket from "@/components/template/p-user/tickets/sendTicket";
import Tickets from "@/components/template/p-user/tickets/tickets";

const page = async ({ searchParams }) => {
    const user = await authUser()
    const searchparams = searchParams

    const paginatedData = await paginate(
        TicketModel,
        searchparams,
        { "message.senderID": user._id },
        "department"
    )

    return (
        <>
            <div>
                <h1 className="title">
                    <span>Tickets</span>
                </h1>
            </div>
            <main className="container">
                {paginatedData.data.length > 0 ? <Tickets
                    tickets={JSON.parse(JSON.stringify(paginatedData.data))} /> :
                    <p className={styles.empty}>NO Ticket Yet !</p>
                }
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
                <SendTicket />
            </main>
        </>
    );
};

export default page;
