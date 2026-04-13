import './globals.css'

export const metadata = {
  title: 'Auto Client Finder',
  description: 'Find local businesses and generate outreach messages',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="max-w-5xl mx-auto p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">Auto Client Finder</h1>
            <nav className="space-x-4">
              <a href="/" className="text-sky-600">Find</a>
              <a href="/dashboard" className="text-sky-600">Dashboard</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
