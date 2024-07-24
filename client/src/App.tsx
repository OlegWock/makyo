import { Route, Switch } from "wouter";
import { PageTemplate } from "@client/components/PageTemplate";
import { AuthGate } from "@client/components/AuthGate";
import { RootPage } from "@client/routes/RootPage";
import { NotFound } from "@client/routes/NotFound";
import { SettingsPage } from "@client/routes/SettingsPage";
import { ChatsPage } from "@client/routes/ChatsPage";
import { SnippetsPage } from "@client/routes/SnippetsPage";
import { QueryClientProvider } from "@client/api";
import { ChatPage } from "@client/routes/ChatPage";
import { SubscriptionProvider } from "./api/subscription";
import { ErrorBoundary } from "@client/components/ErrorBoundary";
import { Router } from "./components/Router/Router";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from "@client/components/LocalToast";
import { LocalOllamaProxyProvider } from "@client/api/ollama-proxy";
import { PersonasPage } from "@client/routes/PersonasPage";
import { LazyMotion } from "framer-motion";
import { Toaster } from 'react-hot-toast';


const fmFeatures = () => import('./utils/lazy-fm').then(m => m.default);

export const App = () => {
  return (
    <ToastProvider animationDuration={200}>
      <QueryClientProvider>
        <Router>
          <AuthGate>
            <LazyMotion features={fmFeatures} strict>
              <LocalOllamaProxyProvider>
                <SubscriptionProvider>
                  <PageTemplate>
                    <ErrorBoundary>
                      <Switch>
                        <Route path="/" component={RootPage} />
                        <Route path="/chats" component={ChatsPage} />
                        <Route path="/chats/:id" component={ChatPage} />
                        <Route path="/snippets" component={SnippetsPage} />
                        <Route path="/personas" component={PersonasPage} />
                        <Route path="/settings" component={SettingsPage} />
                        <Route component={NotFound} />
                      </Switch>
                    </ErrorBoundary>
                  </PageTemplate>
                </SubscriptionProvider>
              </LocalOllamaProxyProvider>
            </LazyMotion>
          </AuthGate>
          {/* <ReactQueryDevtools /> */}
        </Router>
      </QueryClientProvider>
      <Toaster 
        position="bottom-right"
        
      />
    </ToastProvider>
  );
};
