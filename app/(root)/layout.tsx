import { Navbar } from "./_navbar";
import { FunctionComponent } from "react";

const Layout: FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div id="root-layout" className="h-full">
      <Navbar />
      <main className="pt-16 h-full">{children}</main>
    </div>
  );
};

export default Layout;