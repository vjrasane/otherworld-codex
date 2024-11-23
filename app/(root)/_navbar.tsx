import Link from "next/link";
import { FunctionComponent } from "react";

import { config } from "@/app.config";

export const Navbar: FunctionComponent = async () => {
  return (
    <div
      id="navbar"
      className="fixed top-0 w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary"
    >
      <div className="flex items-center">
        <Link href="/">
          <h1
            className="text-xl md:text-3xl font-bold
          font-super-comic text-orange-400"
          >
            {config.appName.toUpperCase()}
          </h1>
        </Link>
      </div>
    </div>
  );
};