import { Navbar, Hero, ProductDemo, HowItWorks, UseCases, Pricing, CTA, Footer } from '@/components/landing';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white selection:bg-primary/30 pt-16 flex flex-col">
      <Navbar />
      <Hero />
      <ProductDemo />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
