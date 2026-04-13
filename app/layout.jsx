import './globals.css'

export const metadata = {
  title: 'Auto Client Finder',
  description: 'Find local businesses and generate outreach messages',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold"> <span className="brand-gradient">Auto Client Finder</span></h1>
              <div className="text-sm text-slate-600">Find local businesses, generate outreach and send emails — faster.</div>
            </div>
            <nav className="space-x-4">
              <a href="/" className="text-sky-600 hover:underline">Find</a>
              <a href="/dashboard" className="text-sky-600 hover:underline">Dashboard</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
