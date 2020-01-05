import React, { ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const Frame = ({ children }: IProps) => {
  return <div className="wrapper">{children}</div>;
};

export default Frame;
