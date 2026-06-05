import { Header } from "./header";
import { Footer } from "./footer";
function LayoutWrapper({ children }) {
  return <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
    </div>;
}
export {
  LayoutWrapper
};

