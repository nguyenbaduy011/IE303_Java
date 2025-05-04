export default function Home() {
  return (
    <div className="flex flex-col bg-white">
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl text-black">
              Welcome to Socius
            </h1>
            <p className="max-w-[700px] text-lg text-slate-400 text-muted-foreground ">
              Your all-in-one platform for employee collaboration and workplace
              community.
            </p>
            <div className="bg-primary text-primary-foreground p-4 rounded-lg">
              Hello Nihongo Rashii 🌿
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
