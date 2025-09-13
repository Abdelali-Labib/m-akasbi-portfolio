"use client";

import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

function Header() {
  return (
    <>
      {/* Mobile Navbar */}
      <div className="lg:hidden">
        <MobileNavbar />
      </div>
      
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <DesktopNavbar />
      </div>
    </>
  );
}

export default Header;
