
import ReactDom from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/usuario.context.tsx';
import React from 'react'
import App from './App.tsx'

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </ UserProvider>
  </React.StrictMode>,
)
