import { appConfig } from "@/app.config";
import Link from "next/link";
import { FunctionComponent } from "react";
import { SearchField } from "./_search-field";

export const Navbar: FunctionComponent = () => {
  return (
    <div
      id="navbar"
      className="grid grid-cols-8 fixed top-0 w-full z-50 py-2 px-4 border-b border-primary/10 bg-secondary"
    >
      <div className="col-span-2 flex flex-grow-0 items-center">
        <Link href="/">
          <h1 className="text-xl md:text-3xl font-teutonic whitespace-nowrap">
            {appConfig.appName.toUpperCase()}
          </h1>
        </Link>
      </div>

      <div className="col-span-4 flex justify-center">
        <SearchField />
      </div>

      <div className="col-span-2"></div>
    </div>
  );
};
