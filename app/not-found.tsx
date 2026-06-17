import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container py-20">
      <h1 className="text-4xl font-black text-slate-950">Page not found</h1>
      <p className="mt-4 text-slate-700">This page may have moved, or the private result link may have expired.</p>
      <Link href="/" className="mt-6 inline-flex rounded-md bg-blue-600 px-5 py-3 font-bold text-white">
        Go to checker
      </Link>
    </main>
  );
}
