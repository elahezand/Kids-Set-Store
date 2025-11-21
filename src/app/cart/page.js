import Table from "@/components/template/cart/table";
import styles from "@/styles/cart.module.css";
import Navbar from "@/components/modules/navbar/navbar";
import Footer from "@/components/modules/footer/footer";

const page = () => {
  return (
    <>
      <Navbar />
      <main className={styles.cart}
        data-aos="fade-up">
        <Table />
      </main>
      <Footer />
    </>
  );
};

export default page;
