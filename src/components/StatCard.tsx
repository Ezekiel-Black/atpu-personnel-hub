import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({ title, value, icon, description, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'before:bg-muted-foreground',
    primary: 'before:bg-primary',
    success: 'before:bg-success',
    warning: 'before:bg-warning',
  };

  return (
    <div className={cn('stat-card', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
