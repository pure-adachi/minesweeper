import React, { useEffect, useState } from "react";

interface IProps {
  startUnixTime: number;
  finishedUnixTime: number;
}

const Time = ({ startUnixTime, finishedUnixTime }: IProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  });

  if (!startUnixTime) {
    return <>000</>;
  }

  const timeStr = (time = Math.floor(now.getTime() / 1000) - startUnixTime) => {
    if (time < 0) {
      return "0";
    } else if (time >= 999) {
      return "999";
    } else {
      return String(time);
    }
  };

  const zeroPaddingTime = (time = timeStr()) => {
    return ("000" + time).slice(time.length);
  };

  if (finishedUnixTime) {
    return <>{zeroPaddingTime(timeStr(finishedUnixTime - startUnixTime))}</>;
  }

  return <>{zeroPaddingTime()}</>;
};

export default Time;
