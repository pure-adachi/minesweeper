import React from "react";

interface IProps {
  numStr: string;
}

const DigitalNumber = ({ numStr }: IProps) => {
  return (
    <div className={`digital-number number-${numStr}`}>
      <div className="section top" />
      <div className="section top-right" />
      <div className="section top-left" />
      <div className="middle" />
      <div className="section bottom-right" />
      <div className="section bottom-left" />
      <div className="section bottom" />
    </div>
  );
};

export default DigitalNumber;
