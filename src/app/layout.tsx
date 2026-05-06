
import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WLV Asset Tracker - Rastreador de ativos',
  description: 'Controle de movimentação de ativos imobilizados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        <header>
          <div className="container header-content">
            <h1>WLV Asset Tracker - Rastreador de ativos</h1>
            <nav>
              <button className="btn btn-primary">Novo Movimento</button>
            </nav>
          </div>
        </header>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
