import DetailProfile from "@/components/template/p-user/detail-profile/detail-profile";
import { getMe } from "@/utils/serverHelper";
const page = async () => {
  const Info = await getMe()

  return (
    <>
      <div>
        <h1 className="title">
          <span>Detail-account</span>
        </h1>
      </div>
      <DetailProfile userData={JSON.parse(JSON.stringify(Info))} />
    </>
  );
};

export default page;
