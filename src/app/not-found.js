import Link from "next/link";

const page = () => {
  return (
    <div className="overflow-hidden">
      <div className="mx-auto my-16 flex max-w-[700px] flex-col items-center justify-center gap-2 px-4 sm:flex-row sm:justify-between sm:gap-0 md:my-24">
        <p
          className="-z-10 mr-0 text-[5rem] leading-none text-coral-300 sm:mr-[2%] sm:text-[7rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem]"
          style={{ textShadow: "14px 10px #7bc89c" }}
        >
          4
        </p>
        <div className="mug-404" aria-hidden="true"></div>
        <p
          className="-z-10 ml-0 text-[5rem] leading-none text-sage-400 sm:ml-[2%] sm:text-[7rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem]"
          style={{ textShadow: "14px 10px #ff8c61" }}
        >
          4
        </p>
      </div>
      <div className="mx-10 mb-10 mt-10 text-center text-lg text-sage-400 sm:text-xl md:text-2xl" style={{ direction: "rtl" }}>
        <p className="mb-2.5">Page Is Not Found :((</p>
        <Link href="/" className="border-b border-gray-800 text-lg text-sage-400">Back To Home Page</Link>
      </div>
    </div>
  );
};

export default page;
