import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import dotenv from 'dotenv';
dotenv.config();

createRoot(document.getElementById("root")!).render(<App />);
