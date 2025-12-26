import { Suspense } from "react";
import FacilitiesClient from "./FacilitiesClient";
import { getFacilities } from "@/actions/admin/facilities";

export default async function FacilitiesPage() {
  const result = await getFacilities();
  const facilities = result.success && result.data ? result.data : [];

  return (
    <Suspense fallback={<div>Loading facilities...</div>}>
      <FacilitiesClient initialFacilities={facilities} />
    </Suspense>
  );
}
