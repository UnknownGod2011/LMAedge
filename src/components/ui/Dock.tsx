'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { Children, cloneElement, useEffect, useMemo, useRef, useState, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DockItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: any;
  distance: number;
  magnification: number;
  baseItemSize: number;
}

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-background/80 border border-border shadow-md cursor-pointer outline-none transition-colors hover:bg-accent/50",
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) => cloneElement(child as ReactElement, { isHovered }))}
    </motion.div>
  );
}

function DockLabel({ children, className = '', ...rest }: any) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, x: '-50%' }}
          animate={{ opacity: 1, y: -10, x: '-50%' }}
          exit={{ opacity: 0, y: 0, x: '-50%' }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-border bg-popover px-2 py-0.5 text-xs text-popover-foreground shadow-md",
            className
          )}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-center", className)}>{children}</div>;
}

export interface DockProps {
  items: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }[];
  className?: string;
  spring?: { mass: number; stiffness: number; damping: number };
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-center">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "mx-auto flex items-end gap-4 rounded-2xl px-4 pb-3",
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
