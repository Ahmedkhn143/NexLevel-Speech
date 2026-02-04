import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Simple check for auth token cookie
    // In a real app, verify JWT signature or validate session
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/app/:path*',
}
