import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeInstantGame } from './utils/instantGames';

void initializeInstantGame().finally(() => {
	createRoot(document.getElementById('root')!).render(<App />);
});
