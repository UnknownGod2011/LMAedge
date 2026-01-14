import { cn } from '@/lib/utils';

type Status = 'pending' | 'processing' | 'complete' | 'error' | 'uploading' | 'parsing';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'status-pending',
  },
  processing: {
    label: 'Processing',
    className: 'status-pending',
  },
  uploading: {
    label: 'Uploading',
    className: 'status-pending',
  },
  parsing: {
    label: 'Parsing',
    className: 'status-pending',
  },
  complete: {
    label: 'Complete',
    className: 'status-complete',
  },
  error: {
    label: 'Error',
    className: 'status-error',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200',
        config.className,
        className
      )}
    >
      {status === 'processing' || status === 'parsing' || status === 'uploading' ? (
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {config.label}
    </span>
  );
}
