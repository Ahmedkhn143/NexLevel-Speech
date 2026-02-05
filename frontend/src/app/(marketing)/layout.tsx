import { Navbar, Footer } from '@/components/landing';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        {/* Cyber grid */}
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(240_15%_3%_/_0.5)_70%,hsl(240_15%_3%)_100%)]" />
      </div>
      
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
