import { NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function proxy(request) {
  const path = request.nextUrl.pathname
  console.log('Middleware executing for path:', path)

  const publicPaths = ['/login', '/signup', '/admin-login']
  const protectedPaths = ['/account', '/account-billing', '/list-property', '/account-password', '/account-savelists']
  
  const isPublicPath = publicPaths.includes(path)
  const isProtectedPath = protectedPaths.includes(path)
  
  // Check for dynamic path segments
  const isBookingPath = path.startsWith('/booking')
  const isBookingConfirmationPath = path.startsWith('/booking-confirmation')
  const isDashboardPath = path.startsWith('/admin') && path !== '/admin-login'
  const isHostPath = path.startsWith('/host/')
  
  // Group all protected routes
  const requiresAuth = isProtectedPath || isBookingPath || isBookingConfirmationPath || isHostPath || isDashboardPath
  
  // Extract token
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('authToken')?.value || 
                request.cookies.get('jwt')?.value || ''
  
  console.log('Token found:', !!token, 'for path:', path)

  let isValidToken = false
  let decodedToken = null

  // 1. Centralized Token Validation
  if (token) {
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp > currentTime) {
        isValidToken = true
        decodedToken = decoded
      } else {
        console.log('Token found but expired.')
      }
    } catch (error) {
      console.log('Token found but invalid (decode error):', error.message)
    }
  }

  // Helper function to clear cookies on a given response object
  const clearCookies = (response) => {
    response.cookies.delete('token')
    response.cookies.delete('authToken')
    response.cookies.delete('jwt')
    return response
  }

  // 2. Handle Invalid Tokens
  if (token && !isValidToken) {
    if (requiresAuth) {
      // If trying to access a protected route with a bad token, wipe it and redirect to login
      const loginUrl = isDashboardPath ? '/admin-login' : '/login'
      const response = NextResponse.redirect(new URL(loginUrl, request.url))
      return clearCookies(response)
    } else {
      // If on a public route (like /login) with a bad token, wipe it but let the page load
      const response = NextResponse.next()
      return clearCookies(response)
    }
  }

  // 3. Handle Valid Tokens on Public Paths (Redirect away from login/signup)
  if (isPublicPath && isValidToken) {
    console.log('Valid token on public path, redirecting to home')
    // Optionally redirect admins to the admin dashboard instead of home
    if (decodedToken?.role === 'admin' && path === '/admin-login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Handle Missing Tokens on Protected Paths
  if (requiresAuth && !isValidToken) {
    console.log('No valid token for protected path, redirecting to login')
    const loginUrl = isDashboardPath ? '/admin-login' : '/login'
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  // 5. Handle Role-Based Access for Valid Tokens
  if (requiresAuth && isValidToken) {
    if (isDashboardPath && decodedToken?.role !== 'admin') {
      console.log('User does not have admin role:', decodedToken?.role)
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    console.log('Token valid and authorized for protected path')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin-login',
    '/login',
    '/signup',
    '/admin/:path*',
    '/host/:path*',
    '/booking/:path*',
    '/booking-confirmation/:path*',
    '/account', 
    '/account-billing', 
    '/account-password', 
    '/account-savelists',
    '/list-property',
  ]
}