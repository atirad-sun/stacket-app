export interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export function Keypad({ onDigit, onBackspace }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ROWS.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="tap-target rounded-xl bg-surface text-heading text-numeric text-text"
        >
          {digit}
        </button>
      ))}
      <span aria-hidden="true" />
      <button
        type="button"
        onClick={() => onDigit('0')}
        className="tap-target rounded-xl bg-surface text-heading text-numeric text-text"
      >
        0
      </button>
      <button
        type="button"
        aria-label="ลบ"
        onClick={onBackspace}
        className="tap-target rounded-xl bg-surface text-text-2"
      >
        <span aria-hidden="true">⌫</span>
      </button>
    </div>
  );
}
