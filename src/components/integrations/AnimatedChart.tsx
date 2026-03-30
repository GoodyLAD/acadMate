import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedChartProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedChart;
