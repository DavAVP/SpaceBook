
import ReactDom from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/usuario.context.tsx';
import React from 'react'
import App from './App.tsx'
import './styles/variables.css';
import { registerSW } from 'virtual:pwa-register'

// Registrar el service worker al iniciar la app
registerSW({
  onRegistered() {
    console.log('Service Worker registrado con éxito');
  },
  onNeedRefresh() {
    console.log('Hay una nueva versión de la app');
  }
});

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </ UserProvider>
  </React.StrictMode>,
)


