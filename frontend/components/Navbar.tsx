import Image from "next/image";
import React from "react";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full py-4 bg-white [box-shadow:0px_-8px_25px_0px_#00000038]">
      <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
        <Image
          src={"/AIPlanetLogo.png"}
          width={0}
          height={0}
          sizes="100%"
          className="h-8 w-auto"
          alt="logo"
        />

        <div className="flex gap-4 items-center text-sm">
          {/* <label className="rounded border px-5 py-2 border-black flex items-center gap-2 cursor-pointer">
            <IoAddCircleOutline size={20} />
            Upload PDF
            <input type="file" accept="application/pdf" className="hidden" />
          </label> */}
          {/* <FileUpload/> */}
        </div>
      </div>
    </nav>
  );
}
