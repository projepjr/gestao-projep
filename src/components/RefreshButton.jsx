import { RefreshCw } from 'lucide-react'

export default function RefreshButton({ label = 'Atualizar', onClick, loading = false, className = '' }) {
  return (
    <span className={`relative inline-flex group ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-8 h-8 rounded-full border border-[#1E1E1E] bg-[#111111] text-gray-500 hover:text-[#FF882D] hover:border-[#CE7028]/60 hover:bg-[#CE7028]/10 disabled:opacity-60 transition-all flex items-center justify-center"
        aria-label={label}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
      <span className="pointer-events-none absolute right-0 top-10 z-50 w-max max-w-[220px] rounded border border-[#CE7028] bg-[#1E1E1E] px-3 py-2 text-xs font-medium text-white shadow-xl opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 whitespace-normal">
        {label}
      </span>
    </span>
  )
}
