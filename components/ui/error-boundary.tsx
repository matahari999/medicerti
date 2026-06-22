'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">오류가 발생했습니다</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
            {this.state.error?.message ?? '예상치 못한 문제가 생겼습니다'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            다시 시도
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
