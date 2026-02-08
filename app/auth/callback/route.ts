import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("Auth Callback: Success! Redirecting to", next)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error("Auth Callback Error:", error.message)
    }
  } else {
      console.error("Auth Callback Error: No code found in URL")
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`)
}