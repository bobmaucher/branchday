import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Look up the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Compare provided password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Generate a dummy session token (we can improve this later)
    const sessionToken = `${user.id}-${Date.now()}`;

    // Try to create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("💥 Login route crashed:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}