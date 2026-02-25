import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-display text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: February 25, 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>When you use WhippetShine, we may collect the following information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, phone number when you create an account.</li>
              <li><strong>Vehicle & Address Details:</strong> Vehicle make/model/year and service addresses you provide for bookings.</li>
              <li><strong>Payment Information:</strong> Payment details are processed securely through Stripe. We do not store your full credit card number.</li>
              <li><strong>Usage Data:</strong> How you interact with our app, including pages visited and features used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and manage our auto detailing and pressure washing services.</li>
              <li>To process payments and send booking confirmations.</li>
              <li>To manage your loyalty points and referral rewards.</li>
              <li>To send appointment reminders and service updates (with your consent).</li>
              <li>To improve our app and customer experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Payment Processors:</strong> Stripe, to securely handle transactions.</li>
              <li><strong>Service Providers:</strong> Third-party tools that help us operate the app (hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Data Security</h2>
            <p>We use industry-standard security measures including encryption, secure authentication, and row-level data access controls to protect your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Your Rights</h2>
            <p>You may:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access, update, or delete your account information at any time through your Account page.</li>
              <li>Opt out of promotional communications via Notification Preferences.</li>
              <li>Request deletion of your account and all associated data by emailing <a href="mailto:whippetshine@gmail.com?subject=Account%20Deletion%20Request" className="text-primary hover:underline">whippetshine@gmail.com</a> or using the link on your Account page.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Children's Privacy</h2>
            <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes through the app or via email.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">8. Contact Us</h2>
            <p>If you have questions about this privacy policy, contact WhippetShine at:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email: whippetshine@gmail.com</li>
              <li>Location: Shelby, Ohio</li>
            </ul>
          </section>
        </div>
      </div>
      <FooterSection />
    </main>
  );
};

export default PrivacyPolicy;
