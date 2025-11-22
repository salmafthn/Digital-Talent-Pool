interface LevelHeaderProps {
  level: number
  name: string
  progress: number
  status: "Assessed" | "Unassessed"
}

export default function LevelHeader({ level, name, progress, status }: LevelHeaderProps) {
  const statusColor = status === "Assessed" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
  const statusLabel = status === "Assessed" ? "Dinilai" : "Belum Dinilai"

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap">
          LEVEL {level}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{name}</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-32">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-600 text-center">{progress}%</p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  )
}
