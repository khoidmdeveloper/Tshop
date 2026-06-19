import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Footer() {
  return <footer className="mt-20 border-t border-border bg-card/70">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 -skew-x-12 items-center justify-center rounded-md bg-primary text-xs font-black text-primary-foreground">
                <span className="skew-x-12">T</span>
              </div>
              <span className="font-display text-lg font-bold tracking-[0.14em] text-foreground">TechVortex</span>
            </div>
            <p className="text-sm text-muted-foreground">Your ultimate destination for premium PC components.</p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-foreground">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link to="/products?category=cpu" className="text-muted-foreground hover:text-primary">Processors</Link></li>
              <li><Link to="/products?category=gpu" className="text-muted-foreground hover:text-primary">Graphics Cards</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-primary">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-muted-foreground hover:text-primary">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">© 2026 TechVortex. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-border bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground">
                Discord
              </Button>
              <Button variant="outline" size="sm" className="border-border bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground">
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="border-border bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground">
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}

export {
  Footer
};
