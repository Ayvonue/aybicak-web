import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

// Public, auth'suz: geliştiricilerin spec'i araçlarına (Postman, codegen)
// verebilmesi için.
export async function GET() {
  return NextResponse.json(openApiSpec);
}
