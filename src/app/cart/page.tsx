'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './Cart.module.css'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  maxQuantity: number
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    const loadCart = () => {
      try {
        const mockCart: CartItem[] = [
          {
            id: '1',
            name: 'Produto Premium',
            price: 199.90,
            quantity: 2,
            image: 'https://via.placeholder.com/80',
            maxQuantity: 5
          },
          {
            id: '2',
            name: 'Kit Básico',
            price: 89.90,
            quantity: 1,
            image: 'https://via.placeholder.com/80',
            maxQuantity: 10
          }
        ]
        setCartItems(mockCart)
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id 
          ? { ...item, quantity: Math.min(Math.max(1, newQuantity), item.maxQuantity) }
          : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'DESCONTO10') {
      setDiscount(0.1)
      alert('Cupom aplicado com sucesso!')
    } else {
      alert('Cupom inválido')
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal - (subtotal * discount)
  }

  if (loading) {
    return <div className={styles.loading}>Carregando seu carrinho...</div>
  }

  return (
    <section className={styles.cartSection}>
      <div className={styles.cartContainer}>
        <h1 className={styles.cartTitle}>SEU CARRINHO</h1>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione produtos para continuar</p>
            <Link href="/shop" className={styles.continueLink}>
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.itemsList}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemPrice}>
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    
                    <div className={styles.quantityControl}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.itemSubtotal}>
                    <p>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className={styles.removeButton}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartSummary}>
              <div className={styles.summaryCard}>
                <h3>RESUMO DO PEDIDO</h3>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>R$ {calculateSubtotal().toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                
                {discount > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Desconto</span>
                    <span className={styles.discount}>- {(discount * 100).toFixed(0)}%</span>
                  </div>
                )}
                
                <div className={styles.couponContainer}>
                  <input
                    type="text"
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button onClick={applyCoupon}>Aplicar</button>
                </div>
                
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                
                <button className={styles.checkoutButton}>
                  Finalizar Compra
                </button>
                
                <Link href="/shop" className={styles.continueLink}>
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CartPage