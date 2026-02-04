'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    return { error: 'Login configuration error. Please contact support.' }
  }

  if (password === sitePassword) {
    const cookieStore = await cookies()
    // Set a session cookie that expires in 7 days
    cookieStore.set('session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    redirect('/')
  } else {
    return { error: 'Senha incorreta' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}
