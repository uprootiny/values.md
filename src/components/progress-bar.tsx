import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Progress</span>
        <span className="text-sm text-muted-foreground">{current} of {total}</span>
      </div>
      <Progress value={(current / total) * 100} className="h-2" />
    </div>
  );
}