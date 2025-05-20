// components/Header/index.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RiUserLine, RiUserFill, RiMenuLine } from 'react-icons/ri'
import styles from './HeaderPages.module.css'
import Sidebar from '../Sidebar'
import { useAuth } from '../../../contexts/AuthContext'

const HeaderPages = () => {
  const { user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <>
      <header className={styles.headerPages}>
        <nav>
          <div className={styles.navContainer}>
            <ul className={styles.navLinks}>
              <li><Link href="/" className={styles.logo}>ARTFY</Link></li>
              <li><Link href="/about">Sobre Nós</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/contact">Contato</Link></li>
            </ul>
            <ul className={styles.navLinks}>
              <li>
                <Link 
                  href={user ? "/profile" : "/login"} 
                  aria-label={user ? "Perfil" : "Fazer login"}
                  className={styles.authLink}
                >
                  {user ? (
                    <RiUserFill size={24} className={styles.headerIcon} />
                  ) : (
                    <RiUserLine size={24} className={styles.headerIcon} />
                  )}
                </Link>
              </li>
              <li>
                <button 
                  onClick={toggleSidebar} 
                  aria-label="Menu"
                  className={styles.menuButton}
                >
                  <RiMenuLine size={24} className={styles.headerIcon} />
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
    </>
  )
}

export default HeaderPages