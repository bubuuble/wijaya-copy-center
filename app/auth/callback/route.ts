// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const next = searchParams.get('next') ?? '/'

    // Jika ada error dari Supabase (misal OTP expired)
    if (error) {
        if (errorCode === 'otp_expired' || error === 'access_denied') {
            return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`)
        }
        return NextResponse.redirect(`${origin}/forgot-password?error=${error}`)
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!exchangeError) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Fallback jika tidak ada code dan tidak ada error
    return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`)
}
