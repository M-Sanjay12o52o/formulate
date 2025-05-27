import { Message } from "@formulate/shared-types";
import { NextResponse } from "next/server";

export async function GET() {
  const serverMessage: Message = {
    text: "API response from Formulate!",
    timestamp: new Date(),
  };

  return NextResponse.json(serverMessage);
}
