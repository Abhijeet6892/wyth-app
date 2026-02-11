import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Default to '/' if no 'next' param is provided
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 1. Create the Redirect Response FIRST
    // We need this object because we can only set cookies on a Response, not the Request.
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Write cookies to the RESPONSE object we created above
              response.cookies.set({
                name,
                value,
                ...options,
              })
            )
          },
        },
      }
    )

    // 2. Exchange the Code for a Session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 3. Return the response (which now contains the Session Cookie)
      return response
    }
  }

  // Error Case: Return the user to login with an error code
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}