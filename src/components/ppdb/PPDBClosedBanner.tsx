import { PPDBClosedBannerClient } from "./PPDBClosedBannerClient";
import { getPPDBStatus } from "@/actions/admin/settings";

interface PPDBClosedBannerProps {
  showFull?: boolean;
}

export default async function PPDBClosedBanner({
  showFull = false,
}: PPDBClosedBannerProps) {
  const result = await getPPDBStatus();

  if (!result.success || !result.data) {
    return null;
  }

  const { isOpen, message, startDate, endDate, academicYear, remainingQuota } =
    result.data;

  // If PPDB is open and has remaining quota, don't show banner
  if (isOpen && remainingQuota > 0) {
    return null;
  }

  const isQuotaFull = isOpen && remainingQuota <= 0;

  return (
    <PPDBClosedBannerClient
      showFull={showFull}
      isQuotaFull={isQuotaFull}
      message={message}
      academicYear={academicYear}
      startDate={startDate}
      endDate={endDate}
    />
  );
}
