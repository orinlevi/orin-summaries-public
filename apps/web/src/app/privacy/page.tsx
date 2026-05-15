import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Orin Summaries",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-gray-400">Last updated: March 26, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        When you sign in with Google, we receive your name and email address.
        When you make a purchase, our payment processor (Paddle) handles all
        payment information — we never see or store your credit card details.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>
          <strong>Email address:</strong> To verify your purchase and grant
          access to content.
        </li>
        <li>
          <strong>Name:</strong> For display purposes on the Site.
        </li>
      </ul>

      <h2>3. Data Storage</h2>
      <p>
        Your purchase status is stored securely on Vercel KV (Redis). We store
        only your email address and purchase date. This data is automatically
        deleted after your subscription expires (approximately 6 months).
      </p>

      <h2>4. Third-Party Services</h2>
      <ul>
        <li>
          <strong>Google Sign-In:</strong> For authentication. Subject to{" "}
          <a href="https://policies.google.com/privacy" className="text-purple-400 hover:text-purple-300">
            Google&apos;s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Paddle:</strong> For payment processing. Subject to{" "}
          <a href="https://www.paddle.com/legal/privacy" className="text-purple-400 hover:text-purple-300">
            Paddle&apos;s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Vercel Analytics:</strong> Anonymous usage analytics with no
          personal data collection.
        </li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        We use a single authentication cookie to keep you signed in. We do not
        use tracking cookies or third-party advertising cookies.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You may request deletion of your data at any time by emailing us. We
        will remove all stored information associated with your email address.
      </p>

      <h2>7. Contact</h2>
      <p>
        For privacy-related questions, email us at{" "}
        <a href="mailto:orinl@mail.tau.ac.il" className="text-purple-400 hover:text-purple-300">
          orinl@mail.tau.ac.il
        </a>
        .
      </p>
    </main>
  );
}
