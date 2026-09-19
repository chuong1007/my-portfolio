new_content = """'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function revalidateCache(path: string = '/') {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {}
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("Unauthorized to revalidate cache")
    }

    revalidatePath(path)
  } catch (error) {
    console.error('Revalidate error:', error)
  }
}
"""

with open('src/app/actions.ts', 'w') as f:
    f.write(new_content)
