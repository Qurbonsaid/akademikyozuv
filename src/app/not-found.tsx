import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Sahifa topilmadi</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
