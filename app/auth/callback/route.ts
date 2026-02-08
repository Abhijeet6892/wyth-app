import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // If "next" is passed, redirect there, otherwise go home
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Login successful!
      // The Logic in app/page.tsx will handle the "Profile Check" 
      // and redirect to /onboarding if needed.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If login fails, send them back to login with an error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}