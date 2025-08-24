/**
 * AdminLayout component
 * This layout wraps all pages in the /admin route.
 * Authentication and theme providers are handled in the root layout.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} The rendered layout.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-light dark:bg-primary transition-colors">
      {children}
    </div>
  );
}
