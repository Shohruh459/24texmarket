import { SeatDef } from "../lib/seatLayout";

interface SeatMapProps {
  layout: SeatDef[];
  bookedSeatIds?: string[];
  selectedSeatId?: string | null;
  onSelect?: (seatId: string) => void;
  readOnly?: boolean;
}

export default function SeatMap({
  layout,
  bookedSeatIds = [],
  selectedSeatId,
  onSelect,
  readOnly = false,
}: SeatMapProps) {
  const rows = Math.max(...layout.map((s) => s.row), 0) + 1;

  return (
    <div className="inline-block bg-gray-50 border rounded-xl p-4">
      <div className="grid gap-2" style={{ gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }}>
        {/* Haydovchi qatori */}
        <div className="flex gap-2 justify-center">
          <div className="w-14 h-14 rounded-lg bg-gray-800 text-white flex items-center justify-center text-xs font-semibold">
            🚗 Rul
          </div>
          {layout
            .filter((s) => s.row === 0)
            .map((seat) => (
              <SeatButton
                key={seat.id}
                seat={seat}
                booked={bookedSeatIds.includes(seat.id)}
                selected={selectedSeatId === seat.id}
                readOnly={readOnly}
                onSelect={onSelect}
              />
            ))}
        </div>

        {Array.from({ length: rows - 1 }).map((_, idx) => {
          const rowNum = idx + 1;
          const seatsInRow = layout.filter((s) => s.row === rowNum).sort((a, b) => a.col - b.col);
          return (
            <div key={rowNum} className="flex gap-2 justify-center">
              {seatsInRow.map((seat) => (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  booked={bookedSeatIds.includes(seat.id)}
                  selected={selectedSeatId === seat.id}
                  readOnly={readOnly}
                  onSelect={onSelect}
                />
              ))}
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex gap-4 justify-center mt-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Bo'sh
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Tanlangan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-400 inline-block" /> Band
          </span>
        </div>
      )}
    </div>
  );
}

function SeatButton({
  seat,
  booked,
  selected,
  readOnly,
  onSelect,
}: {
  seat: SeatDef;
  booked: boolean;
  selected: boolean;
  readOnly: boolean;
  onSelect?: (seatId: string) => void;
}) {
  const base = "w-14 h-14 rounded-lg flex items-center justify-center text-[10px] font-medium text-center leading-tight px-1";

  let colorClass = readOnly
    ? "bg-white border-2 border-gray-300 text-gray-700"
    : "bg-green-500 text-white hover:bg-green-600";
  if (booked) colorClass = "bg-gray-400 text-white cursor-not-allowed";
  if (selected) colorClass = "bg-blue-600 text-white";

  return (
    <button
      type="button"
      disabled={readOnly || booked}
      onClick={() => onSelect && onSelect(seat.id)}
      className={`${base} ${colorClass} transition-colors`}
      title={seat.label}
    >
      {seat.label}
    </button>
  );
}
