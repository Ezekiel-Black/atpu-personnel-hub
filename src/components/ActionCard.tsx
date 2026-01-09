import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ActionCard({
  title,
  description,
  icon,
  to,
  onClick,
  disabled = false,
  disabledMessage = 'Insufficient permissions',
}: ActionCardProps) {
  const content = (
    <div className={cn('action-card h-full', disabled && 'disabled')}>
      <div className="rounded-xl bg-primary/10 p-4 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed">{content}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{disabledMessage}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className="text-left w-full">
      {content}
    </button>
  );
}
