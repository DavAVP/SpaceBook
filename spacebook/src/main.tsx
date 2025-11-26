import ReactDom from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/usuario.context.tsx'
import React from 'react'
import App from './App.tsx'
import './styles/variables.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/servicesWorker.js')
      .then(() => console.log('services registrador propio'))
      .catch(err => console.error('Error registrando SW:', err));
  });
}

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
)
