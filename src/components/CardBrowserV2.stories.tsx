import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CardBrowser } from "./CardBrowserV2";
import {
  QueryOptionsContext,
  type QueryOptionsMap,
} from "@/src/data/query-client";
import {
  cards,
  campaigns,
  scenarios,
  encounterSets,
} from "@/src/data";
import { sortBy } from "lodash-es";

const sortedCards = sortBy(cards, "code");

function createSeededClient() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, refetchOnWindowFocus: false },
    },
  });
  const keys = {
    cards: ["cards", "sb"],
    campaigns: ["campaigns", "sb"],
    scenarios: ["scenarios", "sb"],
    encounterSets: ["encounterSets", "sb"],
  };
  qc.setQueryData(keys.cards, sortedCards);
  qc.setQueryData(keys.campaigns, campaigns);
  qc.setQueryData(keys.scenarios, scenarios);
  qc.setQueryData(keys.encounterSets, encounterSets);
  return { qc, keys };
}

const { qc, keys } = createSeededClient();

const queryOptions: QueryOptionsMap = {
  cards: { queryKey: keys.cards, route: "" },
  campaigns: { queryKey: keys.campaigns, route: "" },
  scenarios: { queryKey: keys.scenarios, route: "" },
  encounterSets: { queryKey: keys.encounterSets, route: "" },
};

const meta: Meta<typeof CardBrowser> = {
  component: CardBrowser,
  decorators: [
    (Story) => (
      <QueryClientProvider client={qc}>
        <QueryOptionsContext.Provider value={queryOptions}>
          <div style={{ height: "100vh" }}>
            <Story />
          </div>
        </QueryOptionsContext.Provider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardBrowser>;

export const Default: Story = {};
