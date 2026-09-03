import { cn } from '@/lib/cn';

export interface OTPInputProps {
  value: string;
  length: number;
}

export function OTPInput({ value, length }: OTPInputProps) {
  const digits = value.split('');
  return (
    <div
      role="group"
      aria-label={`รหัส OTP ที่กรอกแล้ว ${digits.join(' ')}`}
      className="flex gap-2"
    >
      {Array.from({ length }, (_, i) => (
        <span
          key={i}
          role="presentation"
          className={cn(
            'flex h-12 w-9 items-center justify-center rounded-lg border text-heading text-numeric',
            i === digits.length ? 'border-primary' : 'border-border',
          )}
        >
          {digits[i] ?? ''}
        </span>
      ))}
    </div>
  );
}
