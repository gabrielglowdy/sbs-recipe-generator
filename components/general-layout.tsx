import React from "react";

const GeneralLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {children}
    </div>
  );
};

export default GeneralLayout;