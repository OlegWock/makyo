import { Route, Switch } from "wouter";
import { Auth } from "./auth"
import { RootPage } from "./routes/Root";
import { NotFound } from "./routes/NotFound";

export const App = () => {
  return (
    <Auth>
      <Switch>
        <Route path="/" component={RootPage} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Auth>
  )
};
