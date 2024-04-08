import { NextRequest, NextResponse } from "next/server";
import { generateFriendImage } from "@/app/lib/generateImage";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting params
  // `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?callerUsername=${frameCallerUsername}&callerPropic=${frameCallerProfileImage}`
  const callerUsername = req.nextUrl.searchParams.get("callerUsername")!;
  const callerPropic = req.nextUrl.searchParams.get("callerPropic")!;

  const frame = await generateFriendImage(callerUsername, callerPropic);
  return new NextResponse(frame);
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
