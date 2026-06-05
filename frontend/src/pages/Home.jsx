import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoryShowcase } from "@/components/home/category-showcase";
function Home() {
  return <LayoutWrapper>
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />
    </LayoutWrapper>;
}
export {
  Home as default
};

