'use client'

import Logo, { LogoIcon } from '@/components/ui/Logo'

export default function LogoPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Carvalytics Logo</h1>
          <p className="text-slate-600">Brand identity and usage examples</p>
        </div>

        {/* Main Logo Sizes */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Logo Sizes</h2>
          <div className="space-y-8">
            <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-lg">
              <Logo size="sm" />
              <span className="text-sm text-slate-600">Small (32px)</span>
            </div>
            <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-lg">
              <Logo size="md" />
              <span className="text-sm text-slate-600">Medium (48px) - Default</span>
            </div>
            <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-lg">
              <Logo size="lg" />
              <span className="text-sm text-slate-600">Large (64px)</span>
            </div>
            <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-lg">
              <Logo size="xl" />
              <span className="text-sm text-slate-600">Extra Large (96px)</span>
            </div>
          </div>
        </section>

        {/* Icon Only */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Icon Only</h2>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="p-4 bg-slate-50 rounded-lg">
              <LogoIcon size={24} />
              <p className="text-xs text-slate-600 mt-2">24px</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <LogoIcon size={32} />
              <p className="text-xs text-slate-600 mt-2">32px</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <LogoIcon size={48} />
              <p className="text-xs text-slate-600 mt-2">48px</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <LogoIcon size={64} />
              <p className="text-xs text-slate-600 mt-2">64px</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <LogoIcon size={96} />
              <p className="text-xs text-slate-600 mt-2">96px</p>
            </div>
          </div>
        </section>

        {/* On Different Backgrounds */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Background Variations</h2>
          <div className="space-y-4">
            <div className="p-8 bg-white border-2 border-slate-200 rounded-lg">
              <Logo size="lg" />
              <p className="text-xs text-slate-600 mt-2">On White</p>
            </div>
            <div className="p-8 bg-slate-100 rounded-lg">
              <Logo size="lg" />
              <p className="text-xs text-slate-600 mt-2">On Light Gray</p>
            </div>
            <div className="p-8 bg-slate-800 rounded-lg">
              <Logo size="lg" className="[&_.text-slate-900]:text-white [&_.text-slate-600]:text-slate-300" />
              <p className="text-xs text-slate-300 mt-2">On Dark Background</p>
            </div>
            <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Logo size="lg" className="[&_.text-slate-900]:text-white [&_.text-slate-600]:text-blue-100" />
              <p className="text-xs text-blue-100 mt-2">On Gradient</p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Usage Examples</h2>

          {/* Header Example */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Navigation Header</h3>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <Logo size="sm" />
              <div className="flex gap-4 text-sm text-slate-600">
                <button className="hover:text-slate-900">Groups</button>
                <button className="hover:text-slate-900">Friends</button>
                <button className="hover:text-slate-900">Settings</button>
              </div>
            </div>
          </div>

          {/* Login Page Example */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Login Page</h3>
            <div className="bg-slate-50 rounded-lg p-12 flex flex-col items-center">
              <Logo size="xl" />
              <div className="mt-8 w-full max-w-sm space-y-3">
                <input
                  type="text"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md"
                  disabled
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md"
                  disabled
                />
                <button className="w-full px-4 py-2 bg-slate-800 text-white rounded-md" disabled>
                  Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Mobile App Icon */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Mobile App Icon</h3>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-200">
                <LogoIcon size={40} />
              </div>
              <div className="w-16 h-16 bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center">
                <LogoIcon size={40} />
              </div>
            </div>
          </div>
        </section>

        {/* Design Notes */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Design Concept</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600">
              The Carvalytics logo features three interconnected circles representing the collaborative
              nature of expense splitting. The circles symbolize different people or groups coming
              together, with the dollar sign at the center representing shared finances.
            </p>
            <ul className="text-slate-600 space-y-2 mt-4">
              <li><strong>Icon:</strong> Three overlapping circles with a central dollar sign</li>
              <li><strong>Colors:</strong> Slate gray tones (professional and neutral)</li>
              <li><strong>Typography:</strong> Bold, modern sans-serif</li>
              <li><strong>Subtext:</strong> Uppercase tracking for "EXPENSE SPLITTER"</li>
            </ul>
          </div>
        </section>

        {/* Color Palette */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Color Palette</h2>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <div className="h-24 bg-slate-900 rounded-lg shadow-md"></div>
              <p className="text-xs text-slate-600 mt-2 font-mono">#1e293b</p>
              <p className="text-xs text-slate-500">Primary Dark</p>
            </div>
            <div>
              <div className="h-24 bg-slate-800 rounded-lg shadow-md"></div>
              <p className="text-xs text-slate-600 mt-2 font-mono">#1e40af</p>
              <p className="text-xs text-slate-500">Secondary</p>
            </div>
            <div>
              <div className="h-24 bg-slate-600 rounded-lg shadow-md"></div>
              <p className="text-xs text-slate-600 mt-2 font-mono">#475569</p>
              <p className="text-xs text-slate-500">Medium</p>
            </div>
            <div>
              <div className="h-24 bg-slate-300 rounded-lg shadow-md border border-slate-200"></div>
              <p className="text-xs text-slate-600 mt-2 font-mono">#cbd5e1</p>
              <p className="text-xs text-slate-500">Light</p>
            </div>
            <div>
              <div className="h-24 bg-white rounded-lg shadow-md border-2 border-slate-200"></div>
              <p className="text-xs text-slate-600 mt-2 font-mono">#ffffff</p>
              <p className="text-xs text-slate-500">Background</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
