export const onlyNumbers = (value: string | null | undefined) =>
  (value ?? '').replace(/\D+/g, '')

export const formatCpf = (value: string | null | undefined) => {
  const digits = onlyNumbers(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export const formatPhone = (value: string | null | undefined) => {
  const digits = onlyNumbers(value)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export const formatCep = (value: string | null | undefined) => {
  const digits = onlyNumbers(value)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
}

export const formatStatus = (value: string | null | undefined) => {
  if (!value) return 'Não informado'
  return value
    .toString()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const formatCurrency = (value: number | string | null | undefined) => {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

