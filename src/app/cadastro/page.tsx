'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './Cadastro.module.css'

interface FormData {
    nome: string
    cpf: string
    data_nascimento: string
    email: string
    telefone_celular: string
    senha: string
    confirmar_senha: string
}

interface FormErrors {
    nome: string
    cpf: string
    data_nascimento: string
    email: string
    telefone_celular: string
    senha: string
    confirmar_senha: string
}

export default function Cadastro() {
    const [formData, setFormData] = useState<FormData>({
        nome: '',
        cpf: '',
        data_nascimento: '',
        email: '',
        telefone_celular: '',
        senha: '',
        confirmar_senha: ''
    })

    const [errors, setErrors] = useState<FormErrors>({
        nome: '',
        cpf: '',
        data_nascimento: '',
        email: '',
        telefone_celular: '',
        senha: '',
        confirmar_senha: ''
    })

    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState('')
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 3) value = value.slice(0, 3) + '.' + value.slice(3)
        if (value.length > 7) value = value.slice(0, 7) + '.' + value.slice(7)
        if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11)
        setFormData(prev => ({
            ...prev,
            cpf: value.substring(0, 14)
        }))
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2)
        if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5)
        setFormData(prev => ({
            ...prev,
            data_nascimento: value.substring(0, 10)
        }))
    }

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 0) value = '(' + value
        if (value.length > 3) value = value.substring(0, 3) + ') ' + value.substring(3)
        if (value.length > 10) value = value.substring(0, 10) + '-' + value.substring(10)
        setFormData(prev => ({
            ...prev,
            telefone_celular: value.substring(0, 15)
        }))
    }

    const validateForm = (): boolean => {
        let valid = true
        const newErrors: FormErrors = {
            nome: '',
            cpf: '',
            data_nascimento: '',
            email: '',
            telefone_celular: '',
            senha: '',
            confirmar_senha: ''
        }

        // Validação do nome
        if (formData.nome.trim() === '') {
            newErrors.nome = 'Por favor, insira seu nome completo'
            valid = false
        }

        // Validação do CPF (14 caracteres com pontuação)
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
            newErrors.cpf = 'CPF deve estar no formato 000.000.000-00'
            valid = false
        }

        // Validação da data (formato DD/MM/AAAA)
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.data_nascimento)) {
            newErrors.data_nascimento = 'Data deve estar no formato DD/MM/AAAA'
            valid = false
        } else {
            const [day, month, year] = formData.data_nascimento.split('/').map(Number)
            const date = new Date(year, month - 1, day)
            if (isNaN(date.getTime())) {
                newErrors.data_nascimento = 'Data inválida'
                valid = false
            }
        }

        // Validação do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Por favor, insira um e-mail válido'
            valid = false
        }

        // Validação do telefone
        if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.telefone_celular)) {
            newErrors.telefone_celular = 'Telefone deve estar no formato (00) 00000-0000'
            valid = false
        }

        // Validação da senha
        if (formData.senha.length < 6) {
            newErrors.senha = 'A senha deve ter pelo menos 6 caracteres'
            valid = false
        }

        // Validação da confirmação de senha
        if (formData.senha !== formData.confirmar_senha) {
            newErrors.confirmar_senha = 'As senhas não coincidem'
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setApiError('')

        if (validateForm()) {
            setIsLoading(true)
            
            try {
                // Converte a data para o formato do backend (AAAA-MM-DD)
                const [day, month, year] = formData.data_nascimento.split('/')
                const birthDateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

                const userData = {
                    name: formData.nome,
                    cpf: formData.cpf, // Mantém a formatação com pontuação (14 caracteres)
                    email: formData.email,
                    pass: formData.senha,
                    birthDate: birthDateISO, // Formato AAAA-MM-DD
                    phone: formData.telefone_celular.replace(/\D/g, ''), // Remove formatação
                    address: "Endereço padrão" // Campo obrigatório no backend
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    if (errorData.errors) {
                        const errorMessages = Object.entries(errorData.errors)
                            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                            .join('\n')
                        throw new Error(errorMessages)
                    }
                    throw new Error(errorData.message || 'Erro ao cadastrar')
                }

                router.push('/login')
            } catch (error) {
                console.error('Erro no cadastro:', error)
                setApiError(error.message || 'Erro ao cadastrar. Verifique os dados.')
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <section className={styles.cadastroSection}>
            <div className={styles.cadastroContainer}>
                <h1 className={styles.cadastroTitle}>Criar uma conta</h1>

                {apiError && (
                    <div className={styles.apiError}>
                        {apiError}
                    </div>
                )}

                <form className={styles.cadastroForm} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="nome" className={styles.formLabel}>Nome Completo*</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className={`${styles.formInput} ${errors.nome ? styles.invalid : ''}`}
                                required
                            />
                            {errors.nome && <span className={styles.errorMessage}>{errors.nome}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cpf" className={styles.formLabel}>CPF*</label>
                            <input
                                type="text"
                                id="cpf"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleCpfChange}
                                placeholder="000.000.000-00"
                                className={`${styles.formInput} ${errors.cpf ? styles.invalid : ''}`}
                                required
                            />
                            {errors.cpf && <span className={styles.errorMessage}>{errors.cpf}</span>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="data_nascimento" className={styles.formLabel}>Data de Nascimento*</label>
                            <input
                                type="text"
                                id="data_nascimento"
                                name="data_nascimento"
                                value={formData.data_nascimento}
                                onChange={handleDateChange}
                                placeholder="DD/MM/AAAA"
                                className={`${styles.formInput} ${errors.data_nascimento ? styles.invalid : ''}`}
                                required
                            />
                            {errors.data_nascimento && <span className={styles.errorMessage}>{errors.data_nascimento}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="telefone_celular" className={styles.formLabel}>Telefone Celular*</label>
                            <input
                                type="tel"
                                id="telefone_celular"
                                name="telefone_celular"
                                value={formData.telefone_celular}
                                onChange={handleTelefoneChange}
                                placeholder="(00) 00000-0000"
                                className={`${styles.formInput} ${errors.telefone_celular ? styles.invalid : ''}`}
                                required
                            />
                            {errors.telefone_celular && <span className={styles.errorMessage}>{errors.telefone_celular}</span>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>E-mail*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`${styles.formInput} ${errors.email ? styles.invalid : ''}`}
                                required
                            />
                            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="senha" className={styles.formLabel}>Senha*</label>
                            <input
                                type="password"
                                id="senha"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                className={`${styles.formInput} ${errors.senha ? styles.invalid : ''}`}
                                required
                                minLength={6}
                            />
                            {errors.senha && <span className={styles.errorMessage}>{errors.senha}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmar_senha" className={styles.formLabel}>Confirmar Senha*</label>
                            <input
                                type="password"
                                id="confirmar_senha"
                                name="confirmar_senha"
                                value={formData.confirmar_senha}
                                onChange={handleChange}
                                className={`${styles.formInput} ${errors.confirmar_senha ? styles.invalid : ''}`}
                                required
                            />
                            {errors.confirmar_senha && <span className={styles.errorMessage}>{errors.confirmar_senha}</span>}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </button>

                    <div className={styles.loginLink}>
                        Já tem uma conta?{' '}
                        <Link href="/login" className={styles.loginLinkText}>
                            Faça login
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    )
}