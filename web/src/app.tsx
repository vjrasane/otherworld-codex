import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { Layout } from "@/components/layout";
import { CampaignList } from "@/pages/campaigns";
import { CampaignView } from "@/pages/campaign";
import { ScenarioView } from "@/pages/scenario";
import { CardView } from "@/pages/card";
import { EncounterSetView } from "@/pages/encounter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: import.meta.env.DEV ? 5_000 : 24 * 60 * 60 * 1000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useBrowserLocation}>
        <Layout>
          <Switch>
            <Route path="/" component={CampaignList} />
            <Route path="/campaigns/:code" component={CampaignView} />
            <Route path="/scenarios/:code" component={ScenarioView} />
            <Route path="/cards/:code" component={CardView} />
            <Route path="/encounters/:code" component={EncounterSetView} />
            <Route>Not found</Route>
          </Switch>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}
