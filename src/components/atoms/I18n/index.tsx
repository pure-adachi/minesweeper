import React, { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "./Locales";

interface IProps {
  children: ReactNode;
  locale: "ja";
}

const I18n = ({ locale, ...props }: IProps) => (
  <IntlProvider locale={locale} messages={messages[locale]} {...props} />
);

I18n.defaultProps = {
  locale: "ja"
};

export default I18n;
