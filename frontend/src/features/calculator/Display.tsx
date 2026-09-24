interface DisplayProps {
  value: string
  loading: boolean
  error: string | null
}

export function Display({ value, loading, error }: DisplayProps) {
  const sizeClass =
    value.length > 14 ? 'display__value--small' : value.length > 9 ? 'display__value--medium' : ''
  const status = error ?? (loading ? 'Calculating…' : '')

  return (
    <div className="display">
      <output className={`display__value ${sizeClass}`} aria-busy={loading}>
        {value}
      </output>
      <p
        className={`display__status${error ? ' display__status--error' : ''}${loading ? ' display__status--loading' : ''}`}
        role="status"
      >
        {status}
      </p>
    </div>
  )
}
