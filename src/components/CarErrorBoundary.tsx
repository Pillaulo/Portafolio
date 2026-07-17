import { Component, type ReactNode } from 'react'
import { Html } from '@react-three/drei'

type Props = { children: ReactNode; label?: string }
type State = { error: Error | null }

/** Prevents a single bad GLB from blanking the whole garage. */
export class CarErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[CarErrorBoundary]', error)
  }

  componentDidUpdate(prev: Props) {
    if (prev.children !== this.props.children && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <Html center>
          <div className="car-loading">
            ERROR MODELO{this.props.label ? `: ${this.props.label}` : ''}
          </div>
        </Html>
      )
    }
    return this.props.children
  }
}
