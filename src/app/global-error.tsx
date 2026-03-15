'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi nghiêm trọng</h2>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-zinc-50 text-zinc-950 font-medium rounded-full hover:bg-zinc-200 transition-colors"
        >
          Tải lại trang
        </button>
      </body>
    </html>
  )
}
