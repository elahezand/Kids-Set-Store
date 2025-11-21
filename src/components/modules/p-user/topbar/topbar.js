"use client";
import { useState } from "react";
import styles from "./topbar.module.css";
import { IoIosSearch, IoIosNotifications } from "react-icons/io";
import Modal from "../modal/modal";
import Image from "next/image";
const Topbar = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const hideModal = () => setShowModal(false);
  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.profile}>
          <Image
            height={200}
            width={200}
            src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg" alt="" />
          <div>
            <p>{user.username}</p>
          </div>

        </div>
        <section>
          <div className={styles.searchBox}>
            <input type="text" placeholder=" Search" />
            <div>
              <IoIosSearch />
            </div>
          </div>
          <div
            onClick={() => setShowNotifications(true)}
         className={styles.notification}
          >
            <IoIosNotifications />
            <span>0</span>
          </div>
        </section>
      </div>

      {showNotifications && (
        <div>
          <div
            onClick={() => setShowNotifications(false)}
         className={styles.notifications_overlay}
          ></div>
          <section className={styles.notifications_box}>
            <div>
              <p
                onClick={() => {
                  setShowNotifications(false);
                  setShowModal(true);
                }}
              >
                Hi
              </p>
              <button onClick={() => setShowNotifications(false)}>See</button>
            </div>
            <div>
              <p
                onClick={() => {
                  setShowNotifications(false);
                  setShowModal(true);
                }}
              >
                Hi             </p>
              <button onClick={() => setShowNotifications(false)}>See</button>
            </div>

            {/* if we dont have any notif we show : */}
            {/* <div>
              <span>پیفامی وجود ندارد</span>
              <IoClose onClick={() => setShowNotifications(false)}/>
            </div> */}
          </section>
        </div>
      )}
      {showModal && (
        <Modal title="از واحد پشتیبانی" hideModal={hideModal}>
          <p className={styles.modal_text} >you are perfect</p>
        </Modal>
      )}
    </>
  );
};

export default Topbar;
