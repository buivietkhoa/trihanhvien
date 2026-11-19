import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User } from '../types'
import { createUser, findUserByEmail, getUser, updateUser } from '../services/api'
import { now, toIso } from '../utils/time'

const STORAGE_KEY = 'thv_user_id'

type AuthValue = {
  user: User | null
  ready: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
  update: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const savedId = () => localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)

// Xác thực mô phỏng trên JSON Server: so khớp email và mật khẩu lưu trong db.json.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const id = savedId()
    if (!id) return setUser(null)
    try {
      setUser(await getUser(id))
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setReady(true))
  }, [refresh])

  function remember(id: string, persist: boolean) {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    ;(persist ? localStorage : sessionStorage).setItem(STORAGE_KEY, id)
  }

  async function login(email: string, password: string, persist: boolean) {
    const found = await findUserByEmail(email)
    if (!found || found.password !== password) throw new Error('Email hoặc mật khẩu không đúng')
    remember(found.id, persist)
    setUser(found)
  }

  async function register(name: string, email: string, password: string) {
    if (await findUserByEmail(email)) throw new Error('Email đã được sử dụng')
    const created = await createUser({
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: '',
      avatar: '',
      coinBalance: 0,
      level: 'HSK 1',
      goal: 'HSK 3 trong 3 tháng',
      preferredTimes: [],
      progress: { done: 0, total: 20 },
      favorites: [],
      passwordChangedAt: toIso(now()).slice(0, 10),
      createdAt: toIso(now()),
    })
    remember(created.id, true)
    setUser(created)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  async function update(data: Partial<User>) {
    if (!user) return
    setUser(await updateUser(user.id, data))
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, refresh, update }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider')
  return value
}
