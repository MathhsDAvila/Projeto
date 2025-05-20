'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './Login.module.css'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    let valid = true
    const newErrors = { email: '', password: '' }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Por favor, insira um e-mail válido'
      valid = false
    }

    if (password.trim() === '') {
      newErrors.password = 'Por favor, insira sua senha'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      await login(email, password)
    } catch (error) {
      setApiError(error.message || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className={styles.loginSection}>
      <div className={styles.loginContainer}>
        <h1 className={styles.loginTitle}>Faça Login</h1>
        
        {apiError && (
          <div className={styles.apiError}>
            {apiError}
          </div>
        )}

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>E-mail*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.formInput} ${errors.email ? styles.invalid : ''}`}
              required
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Senha*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.formInput} ${errors.password ? styles.invalid : ''}`}
              required
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          <div className={styles.forgotPassword}>
            <Link href="/recuperar-senha" className={styles.forgotLink}>Esqueceu sua senha?</Link>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>

          <div className={styles.registerLink}>
            Não tem uma conta? <Link href="/cadastro" className={styles.registerLinkText}>Cadastre-se</Link>
          </div>
        </form>
      </div>
    </section>
  )
}
 
export default Login