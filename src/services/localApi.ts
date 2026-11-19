import seed from '../../db.json'

/**
 * Máy chủ giả lập chạy ngay trong trình duyệt, dùng khi triển khai tĩnh (Vercel)
 * không có JSON Server. Hỗ trợ đúng các truy vấn kiểu JSON Server mà web dùng:
 * lọc theo trường (kể cả _ne, _gte, _lte), q tìm toàn văn, _sort/_order, _page/_limit
 * (trả header X-Total-Count), và GET/POST/PUT/PATCH/DELETE theo id.
 * Dữ liệu lưu trong localStorage nên mỗi người xem có bản dữ liệu riêng.
 */
type Row = Record<string, unknown> & { id: string }
type Db = Record<string, Row[]>

const STORAGE_KEY = 'thv_local_db_v1'

function load(): Db {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // localStorage bị chặn hoặc dữ liệu hỏng: dùng dữ liệu gốc
  }
  return structuredClone(seed) as unknown as Db
}

let db = load()
const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Không lưu được (chế độ riêng tư...): vẫn chạy với dữ liệu trong bộ nhớ
  }
}

/** Xoá dữ liệu đã lưu, quay về dữ liệu demo ban đầu */
export function resetLocalDb() {
  localStorage.removeItem(STORAGE_KEY)
  db = load()
}

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })

function matches(row: Row, params: URLSearchParams) {
  for (const key of new Set(params.keys())) {
    if (key.startsWith('_')) continue
    const values = params.getAll(key)
    if (key === 'q') {
      const text = JSON.stringify(row).toLowerCase()
      if (!values.every((value) => text.includes(value.toLowerCase()))) return false
      continue
    }
    const [, field, op] = key.match(/^(.*?)(_ne|_gte|_lte|_like)?$/) ?? []
    const actual = row[field]
    if (op === '_gte' && !(Number(actual) >= Number(values[0]))) return false
    if (op === '_lte' && !(Number(actual) <= Number(values[0]))) return false
    if (op === '_ne' && values.includes(String(actual))) return false
    if (op === '_like' && !new RegExp(values[0], 'i').test(String(actual))) return false
    if (!op && !values.includes(String(actual))) return false
  }
  return true
}

function sortRows(rows: Row[], params: URLSearchParams) {
  const fields = params.get('_sort')?.split(',').filter(Boolean)
  if (!fields?.length) return rows
  const orders = (params.get('_order') ?? '').split(',')
  return [...rows].sort((a, b) => {
    for (const [index, field] of fields.entries()) {
      const direction = orders[index] === 'desc' ? -1 : 1
      const x = a[field] as never
      const y = b[field] as never
      if (x === y) continue
      if (x === undefined || x === null) return 1
      if (y === undefined || y === null) return -1
      return (x > y ? 1 : -1) * direction
    }
    return 0
  })
}

export async function localFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = new URL(path, 'http://local')
  const [, name, id] = url.pathname.split('/')
  const method = (init?.method ?? 'GET').toUpperCase()
  const body = init?.body ? JSON.parse(String(init.body)) : undefined
  if (name === 'db') return json(db)
  const rows = db[name]
  if (!rows) return json({}, 404)
  const index = id ? rows.findIndex((row) => String(row.id) === decodeURIComponent(id)) : -1

  if (method === 'GET') {
    if (id) return index >= 0 ? json(rows[index]) : json({}, 404)
    const filtered = sortRows(rows.filter((row) => matches(row, url.searchParams)), url.searchParams)
    const limit = Number(url.searchParams.get('_limit')) || 0
    const page = Number(url.searchParams.get('_page')) || 0
    if (page || limit) {
      const size = limit || 10
      const start = ((page || 1) - 1) * size
      return json(filtered.slice(start, start + size), 200, { 'X-Total-Count': String(filtered.length) })
    }
    return json(filtered)
  }
  if (method === 'POST') {
    const row = { id: `${name.slice(0, 2)}${Date.now()}`, ...body } as Row
    rows.push(row)
    save()
    return json(row, 201)
  }
  if (index < 0) return json({}, 404)
  if (method === 'PATCH' || method === 'PUT') {
    rows[index] = method === 'PUT' ? ({ ...body, id: rows[index].id } as Row) : { ...rows[index], ...body }
    save()
    return json(rows[index])
  }
  if (method === 'DELETE') {
    rows.splice(index, 1)
    save()
    return json({})
  }
  return json({}, 405)
}
