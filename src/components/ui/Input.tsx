type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replaceAll(' ', '-')

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <input
        id={inputId}
        className={`mt-2 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100 ${error ? 'border-error' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  )
}
