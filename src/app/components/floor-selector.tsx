"use client"

interface FloorSelectorProps {
  selectedFloor: number | null
  onFloorSelect: (floor: number | null) => void
}

export default function FloorSelector({ selectedFloor, onFloorSelect }: FloorSelectorProps) {
  const floors = [
    { value: null, label: "すべて" },
    ...Array.from({ length: 14 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}階`,
    })),
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">階層選択</h2>
      <div className="space-y-2">
        {floors.map((floor) => (
          <button
            key={floor.label}
            onClick={() => onFloorSelect(floor.value)}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors
                        ${selectedFloor === floor.value ? "bg-sky-100 text-sky-700" : "hover:bg-gray-100"}`}
          >
            {floor.label}
          </button>
        ))}
      </div>
    </div>
  )
}
