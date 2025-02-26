import JsonlBuilder from "./components/JsonlBuilder";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">JSONL Builder</h1>
          <p className="text-muted-foreground text-sm">
            Build JSONL files for AI conversation training data
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <JsonlBuilder />
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
          <p>JSONL Builder - Create valid JSONL files for AI training data</p>
        </div>
      </footer>
    </div>
  );
}
