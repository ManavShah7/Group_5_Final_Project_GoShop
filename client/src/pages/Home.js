import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product, e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert(`Cannot add more! Only ${product.stock} items in stock.`);
        return;
      }
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 90px;
      right: 20px;
      background: #000;
      color: #fff;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = `✓ ${product.name} added to cart`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
    
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <Container className="text-center" style={{ marginTop: '10rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f5f5f5',
          borderTop: '3px solid #000',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#737373', fontWeight: '500' }}>Loading products...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Container>
    );
  }

  return (
    <>
      <div style={{
        background: '#000',
        color: '#fff',
        padding: '4rem 0 3rem',
        marginBottom: '3rem'
      }}>
        <Container>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1rem',
            letterSpacing: '-2px'
          }}>
            Shop Everything
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: '0.8',
            fontWeight: '400',
            maxWidth: '600px'
          }}>
            Premium products at your fingertips
          </p>
          
          <div style={{ marginTop: '2rem' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '0.875rem 1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            />
          </div>
        </Container>
      </div>

      <Container>
        localStorage.setItem('cart', JSON.stringify(cart));
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 90px;
      right: 20px;
      background: #000;
      color: #fff;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = `✓ ${product.name} added to cart`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
    
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <Container className="text-center" style={{ marginTop: '10rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f5f5f5',
          borderTop: '3px solid #000',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#737373', fontWeight: '500' }}>Loading products...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Container>
    );
  }

  return (
    <>
      <div style={{
        background: '#000',
        color: '#fff',
        padding: '4rem 0 3rem',
        marginBottom: '3rem'
      }}>
        <Container>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1rem',
            letterSpacing: '-2px'
          }}>
            Shop Everything
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: '0.8',
            fontWeight: '400',
            maxWidth: '600px'
          }}>
            Premium products at your fingertips
          </p>
          
          <div style={{ marginTop: '2rem' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '0.875rem 1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            />
          </div>
        </Container>
      </div>

      <Container>
        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.625rem 1.25rem',
                background: selectedCategory === cat ? '#000' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#171717',
                border: `1px solid ${selectedCategory === cat ? '#000' : '#e5e5e5'}`,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) {
                  e.target.style.borderColor = '#d4d4d4';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) {
                  e.target.style.borderColor = '#e5e5e5';
                }
              }}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>

       {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: '#737373' }}>Try a different search or category</p>
          </div>
        ) : (
          <>
            <div style={{ 
              marginBottom: '1.5rem',
              color: '#737373',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
      `}</style>
    </>
  );
}

export default Home;

export default Home;