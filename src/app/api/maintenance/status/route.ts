import { NextRequest, NextResponse } from "next/server";
import { getMaintenanceStatus } from "@/actions/admin/settings";

export async function GET(_request: NextRequest) {
  // keep request referenced for future improvements
  void _request;

  try {
    const res = await getMaintenanceStatus();
    if (!res.success)
      return NextResponse.json(
        { success: false, error: res.error },
        { status: 500 }
      );
    return NextResponse.json({ success: true, data: res.data });
  } catch (error) {
    console.error("Error getting maintenance status:", error);
    return NextResponse.json(
      { success: false, error: "Internal" },
      { status: 500 }
    );
  }
}
