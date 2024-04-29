import { Route, Switch } from "wouter";
import { Layout } from "@client/components/Layout";
import { AuthGate } from "@client/components/AuthGate";
import { RootPage } from "@client/routes/RootPage";
import { NotFound } from "@client/routes/NotFound";
import { SettingsPage } from "@client/routes/SettingsPage";
import { ChatsPage } from "@client/routes/ChatsPage";
import { PresetsPage } from "@client/routes/PresetsPage";
import { QueryClientProvider } from "@client/api";
import { ChatPage } from "@client/routes/ChatPage";
import { SubscriptionProvider } from "./api/subscription";
import { ErrorBoundary } from "@client/components/ErrorBoundary";
import { Router } from "./components/Router/Router";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


export const App = () => {
  return (
    <QueryClientProvider>
      <Router>
        <AuthGate>
          <SubscriptionProvider>
            <Layout>
              <ErrorBoundary>
                <Switch>
                  <Route path="/" component={RootPage} />
                  <Route path="/chats" component={ChatsPage} />
                  <Route path="/chats/:id" component={ChatPage} />
                  <Route path="/presets" component={PresetsPage} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route component={NotFound} />
                </Switch>
              </ErrorBoundary>
            </Layout>
          </SubscriptionProvider>
        </AuthGate>
        {/* <ReactQueryDevtools /> */}
      </Router>
    </QueryClientProvider>
  );
};
