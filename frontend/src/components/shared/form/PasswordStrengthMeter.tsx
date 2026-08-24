// src/components/shared/form/PasswordStrengthMeter.tsx
import React, { useMemo } from 'react';

export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function getPasswordStrengthLabel(score: number): { label: string; color: string } {
  switch (score) {
    case 1:
      return { label: 'Molto debole', color: 'text-rose-500' };
    case 2:
      return { label: 'Debole', color: 'text-orange-500' };
    case 3:
      return { label: 'Buona', color: 'text-amber-500' };
    case 4:
      return { label: 'Ottima ✓', color: 'text-emerald-600 font-semibold' };
    default:
      return { label: 'Minimo 6 caratteri', color: 'text-slate-400' };
  }
}

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  className = '',
}) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const info = useMemo(() => getPasswordStrengthLabel(strength), [strength]);

  if (!password) return null;

  return (
    <div className={`space-y-1.5 pt-1 ${className}`}>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => {
          let bgClass = 'bg-slate-200';
          if (strength >= level) {
            if (strength === 1) bgClass = 'bg-rose-500';
            else if (strength === 2) bgClass = 'bg-orange-500';
            else if (strength === 3) bgClass = 'bg-amber-400';
            else bgClass = 'bg-emerald-500';
          }
          return (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${bgClass}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Robustezza password:</span>
        <span className={info.color}>{info.label}</span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
