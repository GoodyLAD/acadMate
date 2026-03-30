import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Boxes = ({ className, ...props }: { className?: string }) => {
  const rows = new Array(50).fill(1);
  const cols = new Array(30).fill(1);
  const colors = [
    '#7dd3fc', // sky-300
    '#f9a8d4', // pink-300
    '#86efac', // green-300
    '#fde047', // yellow-300
    '#fca5a5', // red-300
    '#c4b5fd', // purple-300
    '#93c5fd', // blue-300
    '#a5b4fc', // indigo-300
    '#c4b5fd', // violet-300
  ];
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        'absolute left-1/4 p-4 -top-14 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0',
        className
      )}
      {...props}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          className='h-8 w-16 border-l border-slate-700/20 relative'
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              key={`col` + j}
              className='border-r border-t border-slate-700/20 w-16 h-8 relative'
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  width='15'
                  height='15'
                  className='absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-600'
                >
                  <path
                    fill='currentColor'
                    d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const BackgroundBoxes = ({
  className,
  ...props
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'absolute inset-0 w-full h-full overflow-hidden bg-slate-900',
        className
      )}
      {...props}
    >
      <Boxes />
      <div className='absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none' />
    </div>
  );
};
