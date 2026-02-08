import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 1. Use the Server Client (cookies) to exchange the code
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("Auth Callback: Success! Redirecting to", next)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error("Auth Callback Error:", error.message)
        // Redirect with the REAL error message so we can see it
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code_detected`)
}