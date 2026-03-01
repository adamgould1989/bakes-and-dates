import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function makeSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'invite' | 'recovery' | 'signup' | 'email' | null

  // PKCE flow — Supabase redirected here with ?code=
  // This happens for invites sent from the Supabase dashboard when the
  // Site URL points to / (root) and we forward the code from page.tsx.
  if (code) {
    const supabase = makeSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Any code exchange via this callback is an invite (regular logins
      // go through the login page and never hit this route).
      return NextResponse.redirect(`${origin}/auth/update-password`)
    }
  }

  // OTP / token_hash flow — used when Supabase sends token_hash directly
  if (token_hash && type) {
    const supabase = makeSupabase()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      if (type === 'invite' || type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/update-password`)
      }
      return NextResponse.redirect(`${origin}/calendar`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=The+link+has+expired+or+is+invalid.`)
}
