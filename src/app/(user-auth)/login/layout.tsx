export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="px-4 bg-slate-50">
      <div className="container mx-auto px-4 min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </main>
  );
}
