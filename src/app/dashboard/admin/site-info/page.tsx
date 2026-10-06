import PageHeader from "@/components/modules/panel/pageHeader";
import SiteInfoForm from "@/components/template/p-admin/site-info/siteInfoForm";
import infoService from "@/services/server/public/info";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { SiteInfo } from "@/types";

export const metadata: Metadata = { title: "Site info" };

export default async function AdminSiteInfoPage() {
  await requireAdmin();
  const info = toPlain((await infoService.getInfo()) as SiteInfo | null);

  return (
    <>
      <PageHeader title="Site info" description="Contact details, logo and social links the whole store uses." />
      <SiteInfoForm info={info} />
    </>
  );
}
