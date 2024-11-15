import { Page, LegacyCard, Text, Button, HorizontalStack, Layout } from '@shopify/polaris';

export default function Pricing() {
  return (
    <Page title="Pricing Plans">
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <LegacyCard.Section>
              <Text variant="headingLg" as="h2">
                Free Plan
              </Text>
              <Text color="subdued">
                Access basic features with limited locations.
              </Text>
              <Text variant="headingLg" as="p">$0/month</Text>
              <Button primary>Choose Plan</Button>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard>
            <LegacyCard.Section>
              <Text variant="headingLg" as="h2">
                Pro Plan
              </Text>
              <Text color="subdued">
                Ideal for growing businesses needing more features.
              </Text>
              <Text variant="headingLg" as="p">$20/month</Text>
              <Button primary>Choose Plan</Button>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard>
            <LegacyCard.Section>
              <Text variant="headingLg" as="h2">
                Enterprise Plan
              </Text>
              <Text color="subdued">
                Unlock all features with unlimited locations.
              </Text>
              <Text variant="headingLg" as="p">$50/month</Text>
              <Button primary>Choose Plan</Button>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
