import { authUser } from "@/utils/serverHelper";
import connectToDB from "../../../../db/db";
import Layout from "@/layouts/userPanelLayout";
import { pageinatedData } from "@/utils/helper";
import Pagination from "@/components/modules/pageination/pagination";
import TicketModel from "../../../../model/ticket";
import SendTicket from "@/components/template/p-user/tickets/sendTicket";
import Tickets from "@/components/template/p-user/tickets/tickets";

const page = async ({ searchParams }) => {
    connectToDB()
    const user = await authUser()
    const tickets = await TicketModel.find({ "message.senderID": user._id }, "-__v")
        .sort({
            _id: -1
        })
        .populate("department", "title").lean()


    const param = await searchParams
    const { page } = param
    const [filteredArray, pageCount] = pageinatedData(tickets, page, 5)

    return (
        <Layout>
            <div>
                <h1 className="title">
                    <span>Tickets</span>
                </h1>
            </div>
            <main className="container">
                {tickets.length > 0 ? <Tickets
                    tickets={JSON.parse(JSON.stringify(filteredArray))} /> :
                    <p className={styles.empty}>NO Ticket Yet !</p>
                }
                <Pagination
                    pageCount={pageCount}
                    href="tickets"
                    currentPage={page} />
                <SendTicket />
            </main>
        </Layout>
    );
};

export default page;
