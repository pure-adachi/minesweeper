import React from "react";
import DigitalNumber from "../../atoms/DigitalNumber";

interface IProps {
  count: number;
}

const BombCount = ({ count }: IProps) => {
  const zeroPaddingCount = () => {
    const countStr = String(count);

    return ("000" + countStr).slice(countStr.length);
  };

  return (
    <div className="bomb-count-info">
      {zeroPaddingCount()
        .split("")
        .map((countStr, i) => (
          <DigitalNumber key={i} numStr={countStr} />
        ))}
    </div>
  );
};

export default BombCount;
