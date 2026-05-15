import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Orin Summaries",
};

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-invert">
      <h1>Refund Policy</h1>
      <p className="text-gray-400">Last updated: March 27, 2026</p>

      <h2>Digital Content</h2>
      <p>
        Orin Summaries sells digital course summaries delivered immediately upon
        purchase. Because access is granted instantly, we generally do not offer
        refunds once content has been accessed.
      </p>

      <h2>When We Do Offer Refunds</h2>
      <p>We will provide a full refund if:</p>
      <ul>
        <li>You experience technical issues that prevent you from accessing the content, and we are unable to resolve them.</li>
        <li>You request a refund within 14 days of purchase and have not accessed any paid content.</li>
        <li>You were charged incorrectly or in error.</li>
      </ul>

      <h2>How to Request a Refund</h2>
      <p>
        Email us at{" "}
        <a href="mailto:orinl@mail.tau.ac.il" className="text-purple-400 hover:text-purple-300">
          orinl@mail.tau.ac.il
        </a>{" "}
        with your purchase email and a description of the issue. We aim to
        respond within 2 business days.
      </p>

      <h2>Payment Processing</h2>
      <p>
        All payments are processed by Paddle.com, our merchant of record.
        Approved refunds are issued through Paddle and may take 5-10 business
        days to appear on your statement.
      </p>
    </main>
  );
}
