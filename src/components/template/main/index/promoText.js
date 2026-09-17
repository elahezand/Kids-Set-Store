import Link from 'next/link'

export default function PromoText() {
    return (
        <div className="relative mx-auto my-10 h-[220px] w-full overflow-hidden sm:my-14 sm:h-[320px] md:my-16 md:h-[420px] lg:my-20 lg:h-[520px]">
            <video
                autoPlay
                muted
                loop
                playsInline
                src="/video-from-rawpixel-id-16910203-sd.mp4"
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 mx-auto max-w-[380px] rounded-2xl bg-sage-400/95 p-5 text-center leading-6 text-white shadow-float backdrop-blur-sm sm:inset-x-auto sm:bottom-8 sm:left-8 sm:max-w-[320px] sm:p-6 sm:text-left xl:left-16 xl:max-w-[360px] xl:p-8">
                <span className="text-base font-bold sm:text-lg xl:text-xl">Buy Kids Clothes, in a Professional Style.</span>
                <p className="mt-2 text-sm sm:text-base">Dress your little ones beautifully today with Set Kids</p>
                <Link className="btn btn-accent mt-4 w-full sm:w-auto" href="/contact-us">
                    Contact Us
                </Link>
            </div>
        </div>
    )
}
