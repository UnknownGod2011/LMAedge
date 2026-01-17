import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Search,
  GitCompare,
  Code2,
} from 'lucide-react';
import Dock from '@/components/ui/Dock';
import Orb from '@/components/ui/Orb';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const dockItems = [
    {
      icon: <Upload className="h-5 w-5" />,
      label: 'Analyze',
      onClick: () => navigate('/'),
      className: location.pathname === '/' ? 'border-primary/50 bg-primary/10' : ''
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Loans',
      onClick: () => navigate('/loans'),
      className: location.pathname.startsWith('/loans') && location.pathname !== '/loans/search' && location.pathname !== '/loans/compare' ? 'border-primary/50 bg-primary/10' : ''
    },
    {
      icon: <Search className="h-5 w-5" />,
      label: 'Search',
      onClick: () => navigate('/loans/search'),
      className: location.pathname === '/loans/search' ? 'border-primary/50 bg-primary/10' : ''
    },
    {
      icon: <GitCompare className="h-5 w-5" />,
      label: 'Compare',
      onClick: () => navigate('/loans/compare'),
      className: location.pathname === '/loans/compare' ? 'border-primary/50 bg-primary/10' : ''
    },
    {
      icon: <Code2 className="h-5 w-5" />,
      label: 'API',
      onClick: () => navigate('/api'),
      className: location.pathname === '/api' ? 'border-primary/50 bg-primary/10' : ''
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95">
        <div className="flex items-center justify-between h-20 px-8 gap-6">
          {/* Left - BIG Title */}
          <Link to="/" className="flex items-center group shrink-0">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-[2px] transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/50 mr-3">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <Orb backgroundColor="#ffffff" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                EdgeLedger
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Center - Dock Navigation */}
          <div className="flex-1 flex justify-center">
            <Dock
              items={dockItems}
              panelHeight={60}
              baseItemSize={45}
              magnification={65}
            />
          </div>

          {/* Right - Empty for balance or User Profile later */}
          <div className="w-[140px] flex justify-end">
            {/* Removed Hackathon Badge as requested */}
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
