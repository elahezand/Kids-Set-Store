import { authUser } from "@/utils/serverHelper";
import FavoriteModel from "../../../../model/favorite";
import TicketModel from "../../../../model/ticket";
import commentModel from "../../../../model/comment";
import Tickets from "@/components/template/p-user/index/tickets";
import Orders from "@/components/template/p-user/index/orders";
import styles from "@/styles/p-user/index.module.css";
import Box from "@/components/modules/box/box";

const page = async () => {
  let favorites = []
  let tickets = []
  let comments = []
  let AllTickets = []

  const user = await authUser()

  if (user) {
    favorites = await FavoriteModel.find({ userID: user._id })

    tickets = await TicketModel.find({ "message.senderID": user._id })
      .limit(3)
      .populate("department", "title")
      .sort({ _id: -1 })

    comments = await commentModel.find({ userID: user._id })

    AllTickets = await TicketModel.find({ "message.senderID": user._id })
  }


  return (
      <main>
        <section className={styles.boxes}>
          <Box title="Tickets" value={AllTickets.length} />
          <Box title=" Comments " value={comments.length} />
          <Box title="Orders" value="2" />
          <Box title="Favorites" value={favorites.length} />
        </section>
        <section className={styles.contents}>
          <Tickets tickets={JSON.parse(JSON.stringify(tickets))} />
          <Orders />
        </section>
      </main>
  );
};

export default page;
