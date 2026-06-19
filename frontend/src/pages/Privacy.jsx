"use client";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
function PrivacyPage() {
  return <LayoutWrapper>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="mb-12">
          <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ LEGAL ]</p>
          <h1 className="text-5xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, make a purchase, or
              contact us with a question or comment. This information may include:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Contact information (name, email address, phone number)</li>
              <li>Billing and shipping address</li>
              <li>Payment information</li>
              <li>Account credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Process your orders and send related information</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Send marketing and promotional communications</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
              <li>Third parties with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold certain
              information. You can instruct your browser to refuse cookies or to alert you when cookies are being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
            <p>Depending on your location, you may have rights regarding your personal information, including:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to request deletion of your information</li>
              <li>Right to opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              <br />
              <strong>Email:</strong> privacy@techvortex.com
              <br />
              <strong>Address:</strong> TechVortex Inc., Tech City, TC 12345
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Effective Date" at the top of this document.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link to="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Back to Home</Button>
          </Link>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  PrivacyPage as default
};


