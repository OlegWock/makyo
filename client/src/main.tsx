import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import { App } from './App';
import {enableMapSet} from "immer";

enableMapSet();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
