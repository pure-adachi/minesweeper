import React from "react";
import "../styles/App.scss";
import I18n from "./atoms/I18n";
import Top from "./pages/Top";

const App = () => {
  return (
    <I18n>
      <Top />
    </I18n>
  );
};

export default App;
