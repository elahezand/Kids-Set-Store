import styles from "@/components/modules/navbar/navbar.module.css";
import Link from "next/link";
import CategoryModel from "../../../../model/category";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa";
import FavoriteModel from "../../../../model/favorite";
import CartCount from "./cart";
import { FaPlus } from "react-icons/fa";
import { getMe } from "@/utils/serverHelper";

const Navbar = async () => {
    const user = await getMe()
    let favorites = []

    if (user) {
        favorites = await FavoriteModel.find({ userID: user._id })
    }

    const categories = await CategoryModel.find({}).lean()
    const tree = []

    function buildChildren(parent) {
        const children = [...categories].filter(cat => cat.parentId?.toString() === parent._id.toString())
            .map(cat => ({ ...cat, children: buildChildren(cat) }));

        return children
    }

    categories.filter(parent => {
        if (!parent.parentId) {
            tree.push({ ...parent, children: buildChildren(parent._id) })
        }
    })

    return (
        <>
            <nav className={styles.navbar}>
                <main>
                    <div className={styles.logo}>
                        <Link href="/">
                            SETKIDS
                        </Link>
                    </div>
                    <ul className={styles.links}>
                        <li>
                            <Link href="/"> Home</Link>
                        </li>
                        {JSON.parse(JSON.stringify(tree)).map((category, index) => (
                            <li key={index + 1}
                                className={`${styles.arrow_icon} 
                        ${styles.controol}`}>
                                <Link href={`/products/category/${category.slug}?page=1`}>
                                    {category.name}</Link>
                                <ul className={styles.sub_menu}>
                                    {category.children.map((sub, index) => (
                                        <li key={index + 1}>
                                            <Link href={`/products/category/${category.slug}/${sub.slug}?page=1`}
                                                className={styles.menu_title}
                                            >{sub.name}
                                            </Link>
                                            {sub.children.map((item, index) => (
                                                <ul key={index + 1}
                                                    className={`${styles.sub_menu}${styles.left_menu}`}>
                                                    <li>
                                                        <Link href={`/products/category/${category.slug}/${sub.slug}/${item.slug}?page=1`}>
                                                            {item.name}</Link>
                                                    </li>
                                                </ul>
                                            ))}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                        <li>
                            <Link href="/contact-us"> Contact With Us</Link>
                        </li>
                        <li>
                            <Link href="/about"> About Us</Link>
                        </li>
                        <li>
                            <Link href="/rules">Rules</Link>
                        </li>

                        {user ?
                            <div className={styles.dropdown}>
                                <Link href="/p-user">
                                    <IoIosArrowDown className={styles.dropdown_icons} />
                                    {user.username}
                                </Link>
                                <div className={styles.dropdown_content}>
                                    <Link href="/p-user/orders">Orders</Link>
                                    <Link href="/p-user/tickets"> Tickets </Link>
                                    <Link href="/p-user/comments">Comments</Link>
                                    <Link href="/p-user/wishlist">Favriote</Link>
                                    <Link href="/p-user/account-details">Account Detail </Link>
                                </div>
                            </div> :
                            <li style={{ border: "3px solid var(--primary-color)" }}>
                                <Link href="/login-register">SignUp / LogIn</Link>
                            </li>}
                    </ul>
                    <div className={styles.navbar_icons}>
                        <CartCount />
                        <Link href="/wishList">
                            <FaRegHeart />
                            <span>{favorites.length ? favorites.length : "0"}</span>
                        </Link>
                    </div>
                    <div className={styles.toggler_container}>
                        <input id={styles.toggler}
                            type="checkbox" />
                        <label htmlFor={styles.toggler}
                            className={styles.navbar_toggler__icon}></label>
                        <div className={styles.toggler_menu}>
                            <div className={styles.logo}>
                                <Link href="/">
                                    SETKIDS
                                </Link>
                                <div className={styles.navbar_icons}>
                                    <CartCount />
                                    <Link href="/wishList">
                                        <FaRegHeart />
                                        <span>{favorites.length ? favorites.length : "0"}</span>
                                    </Link>
                                </div>
                            </div>
                            <ul className={styles.links_container}>
                                {user ?
                                    <li>
                                        <input id={styles.toggler_info}
                                            type="checkbox" />
                                        <label htmlFor={styles.toggler_info}
                                            className={styles.toggler_arrow__icon}>
                                            <FaPlus />
                                        </label>
                                        <div className={styles.dropdown_content}>
                                            <Link href="/p-user/orders">Orders</Link>
                                            <Link href="/p-user/tickets"> Tickets </Link>
                                            <Link href="/p-user/comments">Comments</Link>
                                            <Link href="/p-user/wishlist">Favriote</Link>
                                            <Link href="/p-user/account-details">Account Detail </Link>
                                        </div>
                                        {user.username}
                                    </li>
                                    :
                                    <li style={{ border: "3px solid var(--primary-color)" }}>
                                        <Link href="/login-register">SignUp / LogIn</Link>
                                    </li>}
                                <li>
                                    <Link href="/"> Home</Link>
                                </li>
                                {tree.map((category, index) => (
                                    <li key={index + 1}>
                                        <input id={styles.toggler_left}
                                            type="checkbox" />
                                        <label htmlFor={styles.toggler_left}
                                            className={styles.toggler_arrow__icon}>
                                            <FaPlus />
                                        </label>
                                        <ul className={styles.sub_menu}>
                                            {category.children.map((sub, index) => (
                                                <li key={index + 1}>
                                                    <Link href={`/product/category/${category.slug}/${sub.slug}?page=1`}
                                                        className={styles.menu_title}
                                                    >{sub.name}
                                                    </Link>
                                                    {sub.children.map((item, index) => (
                                                        <ul key={index + 1}
                                                            className={`${styles.sub_menu}${styles.left_menu}`}>
                                                            <li>
                                                                <Link href={`/product/category/${category.slug}/${sub.slug}/${item.slug}?page=1`}>
                                                                    {item.name}</Link>
                                                            </li>
                                                        </ul>
                                                    ))}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={`/product/category/${category.slug}?page=1`}>
                                            {category.title}</Link>
                                    </li>
                                ))}
                                <li>
                                    <Link href="/contact-us"> Contact With Us</Link>
                                </li>
                                <li>
                                    <Link href="/about"> About Us</Link>
                                </li>
                                <li>
                                    <Link href="/rules">Rules</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>
            </nav>

        </>
    );
}

export default Navbar;


