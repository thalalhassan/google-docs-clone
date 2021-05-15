import TestEditor from "./components/TextEditor";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {v4 as uuidV4} from 'uuid'
import "./styles.css";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/documents/${uuidV4()}`}/>
        </Route>
        <Route path="/documents/:id" >
          <TestEditor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
