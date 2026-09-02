import React, { createContext, useContext } from 'react'
import { useSession, useDB } from './store/db'
import { PERMISSIONS, ROLES } from './data/seed'

const AuthCtx = createContext(null)

// 会话上下文：准入（US-3.3.1）+ 权限开关（US-3.4.5 / 3.5.1）
export function AuthProvider({ children }) {
  const { session, login: setSessionLogin, logout } = useSession()
  const { db } = useDB()
  const user = useMemoUser(db, session)
  const perm = user ? (PERMISSIONS[user.role] || {}) : {}

  const value = {
    session,
    user,
    roleLabel: user ? (ROLES[user.role]?.label || '') : '游客',
    perm,
    can: (key) => !!perm[key],
    loginById: (userId) => {
      const u = db.users.find((x) => x.id === userId)
      if (u) setSessionLogin(u)
      return u
    },
    logout,
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
function useMemoUser(db, session) {
  return React.useMemo(() => {
    if (!session) return null
    return db.users.find((u) => u.id === session.userId) || null
  }, [db, session])
}

export const useAuth = () => useContext(AuthCtx)
