import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Micro-Task Payment dApp',
  description: 'Pay for micro-tasks using Stellar blockchain and Soroban smart contracts',
  keywords: ['stellar', 'soroban', 'blockchain', 'micro-tasks', 'payments', 'dapp'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-xl">Micro-Task Payment DApp</h1>
          </header>
          <main className="flex-grow p-4">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; {new Date().getFullYear()} Micro-Task Payment DApp</p>
          </footer>
        </div>
      </body>
    </html>
  )
}