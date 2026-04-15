import { DollarSign } from 'lucide-react';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({ 
  amount, 
  currency = '$', 
  size = 'md',
  className = '' 
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <span className={`flex items-center gap-1 font-semibold ${sizeClasses[size]} ${className}`}>
      <DollarSign className={iconSizes[size]} />
      {amount.toLocaleString()}
      {currency !== '$' && <span className="text-xs">{currency}</span>}
    </span>
  );
}