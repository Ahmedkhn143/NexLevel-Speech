import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Simple check for auth token cookie
    // In a real app, verify JWT signature or validate session
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
        // Redirect to login page (note: uses root route, not /auth/login)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/app/:path*',
}
