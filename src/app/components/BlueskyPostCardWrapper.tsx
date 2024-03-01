import React from "react"
import { reportToSentry } from "lib/sentry"
import BlueskyPostCard from "app/components/BlueskyPostCard"

class BlueskyPostErrorBoundary extends React.Component {
  constructor(props) {
    super(props)

    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    reportToSentry(error, errorInfo)
  }

  render() {
    // @ts-ignore
    // eslint-disable-next-line
    if (this.state.hasError) {
      return (
        <div className="px-2 py-16 text-gray-300 text-sm text-center border-b-[1px] border-b-gray-800 last:border-none">
          This post could not be displayed.
        </div>
      )
    }

    // @ts-ignore
    // eslint-disable-next-line
    return this.props.children
  }
}

function BlueskyPostCardWrapper({ post, embedded = false }) {
  return (
    <BlueskyPostErrorBoundary>
      <BlueskyPostCard post={post} embedded={embedded} />
    </BlueskyPostErrorBoundary>
  )
}

export default BlueskyPostCardWrapper
