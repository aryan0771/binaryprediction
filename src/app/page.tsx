import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-slate-950 flex-1 flex flex-col justify-center">
        {/* Glowing gradient background */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent pb-2">
              Predict the Future. <br className="hidden sm:block" /> Capitalize on Insights.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join the world's most advanced enterprise prediction market. Experience real-time dynamic odds, zero-fee settlements, and cryptographic database locking ensuring absolute security.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {session ? (
                <a href="/dashboard" className="rounded-md bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all">
                  Go to Dashboard
                </a>
              ) : (
                <>
                  <a href="/register" className="rounded-md bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all">
                    Get Started
                  </a>
                  <a href="/login" className="text-sm font-semibold leading-6 text-white hover:text-gray-300 transition-colors">
                    Log in <span aria-hidden="true">→</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900 py-24 sm:py-32 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-400">Enterprise Ready</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to trade predictions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Our platform is built on enterprise-grade architecture guaranteeing that every transaction is atomic, idempotent, and secure.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                    <span className="text-xl">⚡</span>
                  </div>
                  Real-Time Odds
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Experience dynamically calculated multipliers based on live liquidity pools. Our engine updates continuously to ensure you always get fair market value.</p>
                </dd>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
                    <span className="text-xl">🔒</span>
                  </div>
                  Absolute Security
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Every bet relies on PostgreSQL row-level locking (SELECT ... FOR UPDATE) ensuring no race conditions or double spending ever occurs under high concurrency.</p>
                </dd>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
                    <span className="text-xl">⚖️</span>
                  </div>
                  Automated Settlement
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Idempotent settlement pipelines guarantee that payouts are executed exactly once. Winners get paid instantly to their wallets without manual intervention.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
