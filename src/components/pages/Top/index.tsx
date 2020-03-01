import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Modes from "../../../constraints/Modes";
import Frame from "../../templates/Frame";
import Board from "../../templates/Board";

interface IProps {
  defaultMode: ModeType;
}

type ModeType = "easy" | "normal" | "hard";

const Top = ({ defaultMode }: IProps) => {
  const [mode, setMode] = useState(defaultMode);
  const { formatMessage } = useIntl();

  const changeMode = ({
    target: { value }
  }: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(value as ModeType);
  };

  return (
    <Frame>
      <div className="title">
        <FormattedMessage id="pages.Top.title" />
      </div>

      <div className="menu">
        <select onChange={changeMode} defaultValue={mode}>
          {Object.keys(Modes).map((key, i) => (
            <option key={i} value={key}>
              {formatMessage({ id: `pages.Top.mode.${key}` })}
            </option>
          ))}
        </select>
      </div>

      <Board modeInfo={Modes[mode]} />
    </Frame>
  );
};

Top.defaultProps = {
  defaultMode: "easy"
};

export default Top;
