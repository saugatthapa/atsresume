export function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-extrabold text-slate-950">FAQ</h2>
      <div className="mt-6 grid gap-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-lg border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer font-bold text-slate-950">{faq.question}</summary>
            <p className="mt-3 leading-7 text-slate-700">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
