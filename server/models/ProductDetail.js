import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import axios from 'axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showToast(`Only ${product.stock} available`, 'warning');
        return;
      }
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('Added to cart');
    navigate('/cart');
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = 'minimal-toast';
    toast.textContent = message;
    if (type === 'warning') {
      toast.style.background = '#f59e0b';
    }
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5 text-center">
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Product not found</h3>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Button 
        variant="secondary" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </Button>
      
      <Row>
        <Col md={6}>
          <div style={{
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#f5f5f5'
          }}>
            <img
              src={product.image.startsWith('http') 
                ? product.image 
                : `http://localhost:5001${product.image}`}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />
          </div>
        </Col>
        
        <Col md={6}>
          <div style={{ padding: '1rem 0' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: '1rem',
              color: '#000',
              letterSpacing: '-0.5px'
            }}>
              {product.name}
            </h1>
            
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '1rem',
              color: '#000'
            }}>
              ${product.price}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
              <Badge bg="secondary" style={{ marginLeft: '0.5rem' }}>
                {product.category}
              </Badge>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: '#fafafa',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h6 style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#525252',
                marginBottom: '0.75rem'
              }}>
                Description
              </h6>
              <p style={{
                color: '#404040',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                {product.description}
              </p>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              className="w-100"
              onClick={addToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductDetail;