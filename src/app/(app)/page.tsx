

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-destructive">Welcome to Socius</h1>
      <div className="mt-4 space-y-2">
        <div className="bg-primary p-2 text-primary-foreground">
          Primary Color Test
        </div>
        <div className="bg-secondary p-2 text-secondary-foreground">
          Secondary Color Test
        </div>
        <div className="bg-muted p-2 text-muted-foreground">
          Muted Color Test
        </div>
        <div className="bg-accent p-2 text-accent-foreground">
          Accent Color Test
        </div>
        <div className="bg-destructive p-2 text-destructive-foreground">
          Destructive Color Test
        </div>
      </div>
    </div>
  );
}
