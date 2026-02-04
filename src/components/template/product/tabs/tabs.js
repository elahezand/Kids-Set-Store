"use client";
import React from "react";
import styles from "./tabs.module.css";
import { useState } from "react";
import Description from "../description/description";
import MoreInfoes from "../moreInfos/moreInfos";
import Comments from "../comments/comments";
const Tabs = ({ product }) => {
  const [tab, setTab] = useState("description");
  return (
    <div data-aos="fade-left"
      className={styles.tabs}>
      <input
        onChange={() => setTab("description")}
        type="radio"
        id="description"
        name="tab-control"
        checked={tab == "description" && "checked"}
      />
      <input
        onChange={() => setTab("moreInfoes")}
        type="radio"
        id="moreInfoes"
        name="tab-control"
        checked={tab == "moreInfoes" && "checked"}
      />
      <input
        onChange={() => setTab("comments")}
        type="radio"
        id="comments"
        name="tab-control"
        checked={tab == "comments" && "checked"}
      />
      <ul>
        <li title="Features">
          <label htmlFor="description" role="button">
            {" "}
            Explnation{" "}
          </label>
        </li>
        <li title="Delivery Contents">
          <label htmlFor="moreInfoes" role="button">
            {" "}
            More Infos{" "}
          </label>
        </li>
        <li title="Shipping">
          <label htmlFor="comments"
            role="button">
            Comments ({product.comments.filter(comment => comment.isAccept).length})
          </label>
        </li>
      </ul>
      <div className={styles.contents}>
        <section className={styles.tabs_content}>
          <Description description={product.longDescription} />
        </section>
        <section className={styles.tabs_content}>
          <MoreInfoes product={product} />
        </section>
        <section className={styles.tabs_content}>
          <Comments
            productId={product._id}
          />
        </section>
      </div>
    </div>
  );
};

export default Tabs;
