import React from 'react'
import styles from "./promoText.module.css"
export default function PromoText() {
    return (
        <div className={styles.container}>
            <video
                autoPlay
                muted
                width={700}
                loop
                src="/video-from-rawpixel-id-16910203-sd.mp4">
            </video>
            <div className={styles.promo_title}>
                <span> Buy Kids Clothes,in a Proffesional Style.</span>
                <p>Dress your little ones beatifully today with Set Kids</p>
            </div>
        </div>
    )
}
