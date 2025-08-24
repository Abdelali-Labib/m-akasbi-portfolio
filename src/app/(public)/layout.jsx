import Header from "@/components/Header/Header";
import { NavbarVisibilityProvider } from '@/Providers/NavbarVisibilityProvider';

/**
 * Public Layout - Only contains public-specific elements
 * Shared providers are handled in the root layout
 */
export default function PublicLayout({ children }) {
  return (
    <NavbarVisibilityProvider>
      <Header />
      {children}
    </NavbarVisibilityProvider>
  );
}
