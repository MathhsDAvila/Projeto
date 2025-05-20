'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Verifica se o usuário é admin
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!user?.role || user.role !== 'ADMIN') {
      router.push('/login') // Redireciona se não for admin
    }
  }, [])

  return (
    <div className="admin-container">
      <h1>Painel Administrativo</h1>
      <div className="admin-content">
        <section className="admin-section">
          <h2>Bem-vindo, Administrador!</h2>
          <p>Você tem acesso total ao sistema.</p>
          
          <div className="admin-cards">
            <div className="admin-card">
              <h3>Usuários</h3>
              <p>Gerencie contas de usuários</p>
            </div>
            
            <div className="admin-card">
              <h3>Configurações</h3>
              <p>Ajuste as configurações do sistema</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}