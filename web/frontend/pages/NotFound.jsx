import React from 'react';
import { Card, EmptyState, Page } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import notfound from "../assets/notfound.jpg";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Page>
      <Card>
        <Card.Section>
          <EmptyState heading={t("NotFound.heading")} image={notfound} imageContained>
          <div style={{ maxWidth: '200px', maxHeight: '200px', margin: '0 auto' }}> <p>{t("NotFound.description")}</p> </div>
            {/* <p>{t("NotFound.description")}</p> */}
          </EmptyState>
        </Card.Section>
      </Card>
    </Page>
  );
};

export default NotFound;

