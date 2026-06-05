"use client";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
function TermsPage() {
  return <LayoutWrapper>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="mb-12">
          <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ LEGAL ]</p>
          <h1 className="text-5xl font-bold text-foreground">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using TechVortex website and services, you accept and agree to be bound by and comply
              with these terms and conditions of use. If you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on
              TechVortex for personal, non-commercial transitory viewing only. This is the grant of a license, not a
              transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on TechVortex</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Disclaimer</h2>
            <p>
              The materials on TechVortex are provided on an 'as is' basis. TechVortex makes no warranties, expressed or
              implied, and hereby disclaims and negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitations</h2>
            <p>
              In no event shall TechVortex or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability
              to use the materials on TechVortex, even if TechVortex or an authorized representative has been notified
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on TechVortex could include technical, typographical, or photographic errors.
              TechVortex does not warrant that any of the materials on the website are accurate, complete, or current.
              TechVortex may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Links</h2>
            <p>
              TechVortex has not reviewed all of the sites linked to its website and is not responsible for the contents
              of any such linked site. The inclusion of any link does not imply endorsement by TechVortex of the site.
              Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Modifications</h2>
            <p>
              TechVortex may revise these terms of service for its website at any time without notice. By using this
              website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction
              in which TechVortex operates, and you irrevocably submit to the exclusive jurisdiction of the courts in
              that location.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link to="/auth/signup">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Agree & Continue</Button>
          </Link>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  TermsPage as default
};


