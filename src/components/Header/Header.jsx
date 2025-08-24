"use client";

import DesktopNavbar from "./Navbars/DesktopNavbar";
import MobileNavbar from "./Navbars/MobileNavbar";

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
