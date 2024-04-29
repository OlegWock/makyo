import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import { App } from './App';
import {enableMapSet} from "immer";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

enableMapSet();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
