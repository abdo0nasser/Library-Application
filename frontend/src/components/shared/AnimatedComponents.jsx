import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';

export const AnimatedCard = ({ children, className = '', ...props }) => (
  <motion.div
    className={`book-card ${className}`}
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, className = '', ...props }) => (
  <motion.button
    className={`btn ${className}`}
    whileHover={{ scale: 1.02, y: -3 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.button>
);

export const AnimatedInput = ({ className = '', ...props }) => (
  <motion.input
    className={className}
    whileFocus={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    {...props}
  />
);

export const FadeInUp = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleInCenter = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, stagger = 0.1, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: stagger,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideInLeft = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideInRight = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const PulseScale = ({ children, ...props }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const GradientShift = ({ children, className = '', ...props }) => (
  <motion.div
    className={className}
    animate={{
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    style={{
      backgroundSize: '200% 200%',
    }}
    {...props}
  >
    {children}
  </motion.div>
);
