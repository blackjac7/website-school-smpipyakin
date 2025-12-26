import { Suspense } from "react";
import ExtracurricularClient from "./ExtracurricularClient";
import { getExtracurriculars } from "@/actions/admin/extracurricular";

export default async function ExtracurricularPage() {
  const result = await getExtracurriculars();
  const data = result.success && result.data ? result.data : [];

  return (
    <Suspense fallback={<div>Loading extracurriculars...</div>}>
      <ExtracurricularClient initialData={data} />
    </Suspense>
  );
}
