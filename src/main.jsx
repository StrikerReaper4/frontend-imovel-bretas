import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from 'next-themes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<ThemeProvider attribute="data-theme">*/}
    <App />
    {/*</ThemeProvider>*/}
  </StrictMode>,
)

// A Home restaura a própria posição; o navegador não deve competir com ela.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
