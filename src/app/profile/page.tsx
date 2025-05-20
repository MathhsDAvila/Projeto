'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, isLoading: authLoading, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
    phone: '',
    address: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiSuccess, setApiSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadUserData()
    }
  }, [user, authLoading])

  const loadUserData = () => {
    try {
      setIsLoading(true)
      setApiError('')
      
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        cpf: user?.cpf ? formatCPF(user.cpf) : '',
        birthDate: user?.birthDate ? formatDate(user.birthDate) : '',
        phone: user?.phone ? formatPhone(user.phone) : '',
        address: user?.address || ''
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      setApiError('Erro ao carregar dados do usuário')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setApiSuccess('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          cpf: formData.cpf.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address,
          birthDate: formData.birthDate
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar perfil')
      }

      const updatedUser = await response.json()
      updateUser(updatedUser.user)
      setApiSuccess('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      console.error('Update error:', error)
      setApiError(error.message || 'Erro ao atualizar perfil')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.profileContainer}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <section className={styles.profileSection}>
      <div className={styles.profileContainer}>
        <h1>Meu Perfil</h1>
        
        {apiError && <div className={styles.apiError}>{apiError}</div>}
        {apiSuccess && <div className={styles.apiSuccess}>{apiSuccess}</div>}

        <form className={styles.profileForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo</label>
            {isEditing ? (
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            ) : (
              <p>{formData.name}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <p>{formData.email}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            {isEditing ? (
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                placeholder="000.000.000-00"
                required
              />
            ) : (
              <p>{formData.cpf || 'Não informado'}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="birthDate">Data de Nascimento</label>
            {isEditing ? (
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            ) : (
              <p>{formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('pt-BR') : 'Não informada'}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Telefone</label>
            {isEditing ? (
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                pattern="\(\d{2}\) \d{5}-\d{4}"
                placeholder="(00) 00000-0000"
                required
              />
            ) : (
              <p>{formData.phone || 'Não informado'}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Endereço</label>
            {isEditing ? (
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            ) : (
              <p>{formData.address || 'Não informado'}</p>
            )}
          </div>

          <div className={styles.buttonGroup}>
            {isEditing ? (
              <>
                <button type="submit" className={styles.submitButton}>Salvar</button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}