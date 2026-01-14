import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceIndicatorProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceIndicator({ 
  confidence, 
  showLabel = false,
  className 
}: ConfidenceIndicatorProps) {
  const getConfidenceLevel = (conf: number) => {
    if (conf >= 90) return { level: 'high', label: 'High confidence' };
    if (conf >= 70) return { level: 'medium', label: 'Medium confidence' };
    return { level: 'low', label: 'Low confidence - review required' };
  };

  const { level, label } = getConfidenceLevel(confidence);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all duration-200',
            level === 'high' && 'confidence-high bg-success/10',
            level === 'medium' && 'confidence-medium bg-warning/10',
            level === 'low' && 'confidence-low bg-destructive/10',
            className
          )}
        >
          <span className="font-mono font-semibold">{confidence}%</span>
          {showLabel && <span className="text-muted-foreground">confidence</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
