// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các trang công khai và tài nguyên tĩnh
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Lấy user từ cookie
  const userCookie = request.cookies.get("user")?.value;

  if (!userCookie) {
    const responseRedirect = NextResponse.redirect(
      new URL("/login", request.url)
    );
    responseRedirect.cookies.set("user", "", {
      path: "/",
      expires: new Date(0),
    });
    return responseRedirect;
  }

  try {
    const user = JSON.parse(userCookie);
    if (!user.id || !user.email) {
      const responseRedirect = NextResponse.redirect(
        new URL("/login", request.url)
      );
      responseRedirect.cookies.set("user", "", {
        path: "/",
        expires: new Date(0),
      });
      return responseRedirect;
    }

    // Kiểm tra session bằng API
    const response = await fetch(
      `http://localhost:8080/api/session/user/${user.id}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      }
    );

    if (response.ok) {
      const isValid = await response.json();
      if (isValid) {
        return NextResponse.next();
      }
    }

    // Session không hợp lệ, xóa cookie và chuyển hướng
    const responseRedirect = NextResponse.redirect(
      new URL("/login", request.url)
    );
    responseRedirect.cookies.set("user", "", {
      path: "/",
      expires: new Date(0),
    });
    return responseRedirect;
  } catch (error) {
    console.error("Middleware error:", error);
    const responseRedirect = NextResponse.redirect(
      new URL("/login", request.url)
    );
    responseRedirect.cookies.set("user", "", {
      path: "/",
      expires: new Date(0),
    });
    return responseRedirect;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|login|forgot-password).*)",
  ],
};
