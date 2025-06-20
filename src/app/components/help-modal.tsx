"use client"

import { X } from "lucide-react"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  const colorMeanings = [
    { color: "border-gray-300", meaning: "清掃不要（連泊）" },
    { color: "border-red-400", meaning: "未チェックアウト" }, 
    { color: "border-purple-400", meaning: "チェックアウト済" },
    { color: "border-yellow-400", meaning: "ゴミ・シーツ回収" },
    { color: "border-green-400", meaning: "ベッドメイク・水回り" },
    { color: "border-blue-400", meaning: "掃除機" },
    { color: "border-cyan-400", meaning: "最終チェック" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-6">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-xl font-bold">枠の色の意味</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 overflow-y-auto flex-grow">
          <div className="space-y-3">
            {colorMeanings.map(({ color, meaning }) => (
              <div key={color} className="flex items-center gap-3">
                <div className={`w-6 h-6 ${color} border-2 rounded`}></div>
                <span>{meaning}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
