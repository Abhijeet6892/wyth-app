import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initialize Response
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
        // Fix 1: Use explicit 'CookieOptions' type to fix the "implicit any" errors
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Fix 2: Use Object Syntax { name, value, ...options } for Next.js 15 compliance
            request.cookies.set({
              name,
              value,
              ...options,
            })
            
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            
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
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Route Protection Logic (Required for the App Flow)
  const url = request.nextUrl.clone()
  const isAuthRoute = url.pathname.startsWith('/login')
  const isOnboardingRoute = url.pathname.startsWith('/onboarding')
  
  // A. No User -> Redirect to Login
  if (!user && !isAuthRoute) {
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