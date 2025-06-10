export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto min-h-[calc(100vh-4rem)]">{children}</div>
    </main>
  );
}
