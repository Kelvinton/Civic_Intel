
import { Outlet } from "react-router-dom";
import Navbar from "../layout/NavBar";
import Footer from "../layout/Footer";

function Layout({ isLoggedIn, onLogout }) {
  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default Layout;
