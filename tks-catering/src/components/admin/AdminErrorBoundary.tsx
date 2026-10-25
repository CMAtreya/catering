import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackDescription?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  showDetails: boolean
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo)
  }

  private handleRetry = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    this.setState({ hasError: false, error: null, showDetails: false })
  }

  private handleGoDashboard = () => {
    window.location.href = '/admin'
  }

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  public render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Something went wrong'
      const description =
        this.props.fallbackDescription ||
        'An unexpected error occurred while loading this administrative view. Your banquet data remains safe.'

      return (
        <div className="min-h-[50vh] p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 text-center space-y-5">
            {/* Error Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs select-none">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="font-heading font-black text-xl text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                {description}
              </p>
            </div>

            {/* Technical details toggle */}
            {this.state.error && (
              <div className="pt-1 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto"
                >
                  <span>{this.state.showDetails ? 'Hide error details' : 'Show error details'}</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed">
                    <p className="font-bold text-white mb-1">Error message:</p>
                    <p>{this.state.error.message}</p>
                    {this.state.error.stack && (
                      <p className="text-slate-400 mt-2 text-[10px] whitespace-pre-wrap">
                        {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons: Retry and Dashboard */}
            <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="h-11 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer tap-target-48 sm:tap-target-auto"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={this.handleRetry}
                className="h-11 px-6 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer tap-target-48 sm:tap-target-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AdminErrorBoundary
