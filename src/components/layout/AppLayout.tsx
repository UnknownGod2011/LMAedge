import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FileText,
  Upload,
  Search,
  GitCompare,
  Code,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Analyze', href: '/', icon: Upload },
  { name: 'Loans', href: '/loans', icon: FileText },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'API', href: '/api', icon: Code },
];

// Dock-style nav item with magnification
function NavItem({ 
  item, 
  isActive, 
  mouseX, 
  baseSize = 45 
}: { 
  item: typeof navigation[0]; 
  isActive: boolean; 
  mouseX: any; 
  baseSize?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  const distance = 150;
  const magnification = 65;
  
  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseSize };
    return val - rect.x - baseSize / 2;
  });

  const width = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );
  
  const widthSpring = useSpring(width, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div style={{ width: widthSpring }}>
      <Link
        ref={ref}
        to={item.href}
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="text-[11px] font-semibold">{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95">
        <div className="flex items-center justify-between h-20 px-8 gap-6">
          {/* Left - BIG Title */}
          <Link to="/" className="flex items-center group shrink-0">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                EdgeLedger
              </span>
              <span className="text-xs text-muted-foreground -mt-1 tracking-widest uppercase font-bold">
                Solutions
              </span>
            </div>
          </Link>
          
          {/* Center - Wide Navigation with Dock Animation */}
          <nav 
            className="flex items-center gap-4 px-8 py-2.5 rounded-xl bg-secondary/50 border border-border shadow-sm flex-1 max-w-2xl justify-center"
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
          >
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isActive={isActive} 
                  mouseX={mouseX}
                />
              );
            })}
          </nav>

          {/* Right - Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border shrink-0">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              LMA Edge Hackathon
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
