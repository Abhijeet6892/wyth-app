import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initialize Response (Mutable)
  // We create a response object that we can attach cookies to.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Update the Request cookies (so immediate next steps see the session)
            request.cookies.set({
              name,
              value,
              ...options,
            })
            
            // Re-create the response to include the updated request cookies
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            
            // Update the Response cookies (so the browser saves the session)
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  // 3. Refresh Session
  // This updates the Auth Cookie if it's expired
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Route Protection Logic
  const url = request.nextUrl.clone()
  const isAuthRoute = url.pathname.startsWith('/login')
  const isOnboardingRoute = url.pathname.startsWith('/onboarding')
  const isCallbackRoute = url.pathname.startsWith('/auth/callback') 

  // A. No User -> Redirect to Login
  // CRITICAL: We MUST exclude the callback route, or the login will never finish.
  if (!user && !isAuthRoute && !isCallbackRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // B. User Logged In -> Redirect away from Login
  if (user && isAuthRoute) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}