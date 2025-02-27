import JsonlBuilder from "./components/JsonlBuilder";
import { Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">JSONL Builder</h1>
              <p className="text-muted-foreground text-sm">
                Build JSONL files for AI conversation training data
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/in/nikolajhoggins/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://x.com/NikolajHoggins"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="X.com (Twitter) Profile"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
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
