type RatingProps = {
  value: number
  max?: number
}

export function Rating({ value, max = 5 }: RatingProps) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-warning" aria-label={`${value}/${max} sao`}>
      {Array.from({ length: max }, (_, index) => (
        <span key={index}>{index < Math.round(value) ? '★' : '☆'}</span>
      ))}
      <span className="ml-1 font-medium text-gray-700">{value.toFixed(1)}</span>
    </span>
  )
}
