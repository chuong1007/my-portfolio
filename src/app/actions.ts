'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateCache(path: string = '/') {
  try {
    revalidatePath(path)
  } catch (error) {
    console.error('Revalidate error:', error)
  }
}
