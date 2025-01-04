import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { SupabaseProvider } from './SupabaseContext';

ReactDOM.render(
    <React.StrictMode>
        <SupabaseProvider>
            <App />
        </SupabaseProvider>
    </React.StrictMode>,
    document.getElementById('root')
); 