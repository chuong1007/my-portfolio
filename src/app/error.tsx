'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Đã xảy ra lỗi hệ thống</h2>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md">
        Chúng tôi xin lỗi vì sự bất tiện này. Có một lỗi xảy ra trong quá trình hiển thị trang.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[var(--text-primary)] text-[var(--bg-base)] font-medium rounded-full hover:opacity-80 transition-colors"
      >
        Thử lại
      </button>
    </div>
  )
}
