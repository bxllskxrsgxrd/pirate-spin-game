import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './scss/_index.scss';
import './scss/_reset.scss';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
