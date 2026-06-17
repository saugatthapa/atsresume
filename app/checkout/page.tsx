import type { Metadata } from "next";
import { CheckoutLauncher } from "./CheckoutLauncher";

export const metadata: Metadata = {
  title: "Checkout | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default function CheckoutPage() {
  return (
    <main className="container grid min-h-[70vh] place-items-center py-20">
      <div className="w-full max-w-xl">
        <CheckoutLauncher />
      </div>
    </main>
  );
}
