"use client"

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  text?: string
}

export default function LoadingSpinner({ size = "medium", text = "読み込み中..." }: LoadingSpinnerProps) {
  const sizeClass = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClass[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  )
}

