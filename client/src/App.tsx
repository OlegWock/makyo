import { Route, Switch } from "wouter";
import { Layout } from "@client/components/Layout";
import { AuthGate } from "@client/components/AuthGate";
import { RootPage } from "@client/routes/RootPage";
import { NotFound } from "@client/routes/NotFound";
import { SettingsPage } from "@client/routes/SettingsPage";
import { ChatsPage } from "@client/routes/ChatsPage";
import { PresetsPage } from "@client/routes/PresetsPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@client/api";
import { Suspense } from "react";
import { ChatPage } from "@client/routes/ChatPage";
import { WebsocketProvider } from "@client/api/websockets";

export const App = () => {
  return (
    <AuthGate>
      <QueryClientProvider client={queryClient}>
        <WebsocketProvider>
          <Layout>
            <Suspense>
              <Switch>
                <Route path="/" component={RootPage} />
                <Route path="/chats" component={ChatsPage} />
                <Route path="/chats/:id" component={ChatPage} />
                <Route path="/presets" component={PresetsPage} />
                <Route path="/settings" component={SettingsPage} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </Layout>
        </WebsocketProvider>
      </QueryClientProvider>
    </AuthGate >
  )
};
