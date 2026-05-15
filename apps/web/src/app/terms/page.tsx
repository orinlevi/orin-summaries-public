import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Orin Summaries",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-gray-400">Last updated: March 26, 2026</p>

      <h2>1. Overview</h2>
      <p>
        Orin Summaries (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides digital course
        summaries and study notes for university students. By using our website
        at orin-summaries.vercel.app (&quot;the Site&quot;), you agree to these terms.
      </p>

      <h2>2. Products &amp; Pricing</h2>
      <p>
        We offer semester-based subscriptions for access to course summaries.
        The current price is displayed on the Site at the time of purchase.
        Payments are processed by our merchant of record, Paddle.com.
      </p>

      <h2>3. Access &amp; Duration</h2>
      <p>
        Upon purchase, you receive access to all course summaries for the
        duration of one academic semester (approximately 6 months). Access does
        not auto-renew. You may purchase a new subscription for subsequent
        semesters.
      </p>

      <h2>4. Content Ownership</h2>
      <p>
        All summaries and study materials on the Site are original works created
        by Orin Levi. You may use them for personal study purposes only. You may
        not redistribute, resell, or share your access with others.
      </p>

      <h2>5. Refunds</h2>
      <p>
        Since our product is digital content delivered immediately upon
        purchase, we generally do not offer refunds. If you experience technical
        issues preventing access, please contact us and we will resolve the
        issue or provide a refund.
      </p>

      <h2>6. Account &amp; Authentication</h2>
      <p>
        Access is granted via Google Sign-In. You are responsible for
        maintaining the security of your Google account. Each purchase is tied
        to a single email address.
      </p>

      <h2>7. Modifications</h2>
      <p>
        We reserve the right to update these terms at any time. Continued use
        of the Site constitutes acceptance of updated terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        For questions or support, email us at{" "}
        <a href="mailto:orinl@mail.tau.ac.il" className="text-purple-400 hover:text-purple-300">
          orinl@mail.tau.ac.il
        </a>
        .
      </p>
    </main>
  );
}
