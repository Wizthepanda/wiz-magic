import SparkOrb from '@/assets/logo-spark-orb.svg';
import { cn } from '@/lib/utils';

type WizupLogoProps = {
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

export function WizupLogo({
  showWordmark = true,
  className,
  wordmarkClassName,
}: WizupLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={SparkOrb}
        alt="WIZUP spark orb logo"
        className="h-10 w-10 object-contain drop-shadow-lg"
        loading="lazy"
      />
      {showWordmark && (
        <span
          className={cn(
            'text-2xl font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent',
            wordmarkClassName
          )}
        >
          WIZUP
        </span>
      )}
    </div>
  );
}

export function SparkOrbIcon({ className }: { className?: string }) {
  return (
    <img
      src={SparkOrb}
      alt="WIZUP spark orb icon"
      className={cn('h-10 w-10 object-contain drop-shadow-lg', className)}
    />
  );
}
