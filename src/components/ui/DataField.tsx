import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DataFieldProps {
  label: string;
  value: ReactNode;
  confidence?: number;
  sourcePage?: number;
  className?: string;
  mono?: boolean;
}

export function DataField({ 
  label, 
  value, 
  confidence, 
  sourcePage,
  className,
  mono = false,
}: DataFieldProps) {
  return (
    <div className={cn('data-field', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <dt className="text-xs font-medium text-muted-foreground mb-1">
            {label}
          </dt>
          <dd className={cn('text-sm text-foreground', mono && 'font-mono')}>
            {value || <span className="text-muted-foreground italic">Not extracted</span>}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-xs shrink-0">
          {sourcePage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span className="font-mono">p.{sourcePage}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Source: Page {sourcePage}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {confidence !== undefined && (
            <ConfidenceIndicator confidence={confidence} />
          )}
        </div>
      </div>
    </div>
  );
}
