import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });
  const [supplierFormData, setSupplierFormData] = useState({
    supplier: '',
    products: [{ product: '', quantity: '', costPrice: '' }],
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSupplierOrders();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchSupplierOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/supplier-orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupplierOrders(response.data);
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/supplier-orders/suppliers/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleShowProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData(product);
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
      });
    }
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setError('');
    setUploadProgress(0);
  };

  const handleProductChange = (e) => {
    setProductFormData({ ...productFormData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadProgress(10);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      setUploadProgress(30);

      const response = await axios.post(
        'http://localhost:5001/api/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 70) / progressEvent.total) + 30;
            setUploadProgress(progress);
          }
        }
      );

      setUploadProgress(100);
      
      setProductFormData({
        ...productFormData,
        image: response.data.url
      });

      setTimeout(() => setUploadProgress(0), 1000);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setUploadProgress(0);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingProduct) {
        await axios.put(
          `http://localhost:5001/api/products/${editingProduct._id}`,
          productFormData,
          config
        );
      } else {
        await axios.post('http://localhost:5001/api/products', productFormData, config);
      }

      fetchProducts();
      handleCloseProductModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const handleShowSupplierModal = () => {
    setSupplierFormData({
      supplier: '',
      products: [{ product: '', quantity: '', costPrice: '' }],
      notes: '',
    });
    setShowSupplierModal(true);
  };

  const handleCloseSupplierModal = () => {
    setShowSupplierModal(false);
    setError('');
  };

  const handleSupplierChange = (e) => {
    setSupplierFormData({ ...supplierFormData, [e.target.name]: e.target.value });
  };

  const handleSupplierProductChange = (index, field, value) => {
    const newProducts = [...supplierFormData.products];
    newProducts[index][field] = value;
    setSupplierFormData({ ...supplierFormData, products: newProducts });
  };

  const addSupplierProduct = () => {
    setSupplierFormData({
      ...supplierFormData,
      products: [...supplierFormData.products, { product: '', quantity: '', costPrice: '' }]
    });
  };

  const removeSupplierProduct = (index) => {
    const newProducts = supplierFormData.products.filter((_, i) => i !== index);
    setSupplierFormData({ ...supplierFormData, products: newProducts });
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const totalCost = supplierFormData.products.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.costPrice)),
        0
      );

      await axios.post(
        'http://localhost:5001/api/supplier-orders',
        { ...supplierFormData, totalCost },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSupplierOrders();
      handleCloseSupplierModal();
      alert('Supplier order created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create supplier order');
    }
  };

  const markSupplierOrderDelivered = async (orderId) => {
    if (!window.confirm('Mark this order as delivered? This will update product stock.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/supplier-orders/${orderId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSupplierOrders();
      fetchProducts();
      alert('Stock updated successfully!');
    } catch (error) {
      alert('Failed to mark order as delivered');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return colors[status] || 'secondary';
  };

  return (
    <Container className="mt-4">
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', color: '#171717' }}>
        Admin Dashboard
      </h2>

      <Tabs defaultActiveKey="products" className="mb-3">
        <Tab eventKey="products" title="Products">
          <div className="mb-3">
            <Button variant="primary" onClick={() => handleShowProductModal()}>
              + Add New Product
            </Button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
            <Table responsive style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td style={{ fontWeight: '600' }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td style={{ fontWeight: '700' }}>${product.price}</td>
                    <td>
                      <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowProductModal(product)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product._id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="orders" title="Customer Orders">
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
            <Table responsive style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: '600' }}>#{order._id.substring(0, 8)}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td style={{ fontWeight: '700' }}>${order.total.toFixed(2)}</td>
                    <td><Badge bg={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Form.Select size="sm" value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)} style={{ width: 'auto' }}>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="supplier" title="Supplier Orders">
          <div className="mb-3">
            <Button variant="success" onClick={handleShowSupplierModal}>+ Create Supplier Order</Button>
          </div>
          {suppliers.length === 0 && <Alert variant="warning">No suppliers registered yet. Register a supplier account first!</Alert>}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
            <Table responsive style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Products</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {supplierOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: '600' }}>#{order._id.substring(0, 8)}</td>
                    <td>{order.supplier?.name || 'N/A'}</td>
                    <td>
                      {order.products.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>• {item.product?.name || 'N/A'} × {item.quantity}</div>
                      ))}
                    </td>
                    <td style={{ fontWeight: '700' }}>${order.totalCost.toFixed(2)}</td>
                    <td><Badge bg={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge></td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>
                      {order.status === 'shipped' && <Button variant="success" size="sm" onClick={() => markSupplierOrderDelivered(order._id)}>Mark Delivered</Button>}
                      {order.status === 'delivered' && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>✓ Stock Updated</span>}
                      {(order.status === 'pending' || order.status === 'confirmed') && <span style={{ fontSize: '0.85rem', color: '#737373', fontWeight: '500' }}>Waiting for supplier...</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      <Modal show={showProductModal} onHide={handleCloseProductModal}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: '700' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleProductSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={productFormData.name} onChange={handleProductChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={productFormData.description} onChange={handleProductChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control type="number" step="0.01" name="price" value={productFormData.price} onChange={handleProductChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" name="category" value={productFormData.category} onChange={handleProductChange} required placeholder="e.g., Electronics" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" name="stock" value={productFormData.stock} onChange={handleProductChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control type="text" name="image" value={productFormData.image} onChange={handleProductChange} placeholder="Paste URL or upload below" className="mb-2" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
                <span style={{ fontSize: '0.75rem', color: '#737373', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
              <label htmlFor="image-upload" style={{ display: 'block', padding: '1rem', border: '2px dashed #d4d4d4', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', color: '#737373', background: '#fafafa' }}>
                📤 Click to Upload Image
              </label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ width: '100%', height: '6px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#000', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.5rem', textAlign: 'center' }}>Uploading... {uploadProgress}%</p>
                </div>
              )}
              <Form.Text className="text-muted">Paste URL or upload (JPG, PNG, GIF - max 5MB)</Form.Text>
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleCloseProductModal}>Cancel</Button>
              <Button variant="primary" type="submit" className="flex-grow-1">{editingProduct ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showSupplierModal} onHide={handleCloseSupplierModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: '700' }}>Create Supplier Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSupplierSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Supplier</Form.Label>
              <Form.Select name="supplier" value={supplierFormData.supplier} onChange={handleSupplierChange} required>
                <option value="">Choose supplier...</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
              </Form.Select>
            </Form.Group>
            <h6 style={{ fontWeight: '700', marginBottom: '1rem' }}>Products to Order</h6>
            {supplierFormData.products.map((item, index) => (
              <div key={index} style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: '#fafafa' }}>
                <div className="row">
                  <div className="col-md-5">
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Product</Form.Label>
                      <Form.Select value={item.product} onChange={(e) => handleSupplierProductChange(index, 'product', e.target.value)} required>
                        <option value="">Select...</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Quantity</Form.Label>
                      <Form.Control type="number" value={item.quantity} onChange={(e) => handleSupplierProductChange(index, 'quantity', e.target.value)} required min="1" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Cost/Unit</Form.Label>
                      <Form.Control type="number" step="0.01" value={item.costPrice} onChange={(e) => handleSupplierProductChange(index, 'costPrice', e.target.value)} required min="0" />
                    </Form.Group>
                  </div>
                  <div className="col-md-1 d-flex align-items-end">
                    {supplierFormData.products.length > 1 && <Button variant="danger" size="sm" onClick={() => removeSupplierProduct(index)} style={{ marginBottom: '0.5rem' }}>×</Button>}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#737373', marginTop: '0.5rem' }}>Subtotal: ${((item.quantity || 0) * (item.costPrice || 0)).toFixed(2)}</div>
              </div>
            ))}
            <Button variant="outline-primary" size="sm" onClick={addSupplierProduct} className="mb-3">+ Add Product</Button>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} name="notes" value={supplierFormData.notes} onChange={handleSupplierChange} placeholder="Special instructions..." />
            </Form.Group>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>Total: ${supplierFormData.products.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.costPrice || 0)), 0).toFixed(2)}</strong>
            </div>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleCloseSupplierModal}>Cancel</Button>
              <Button variant="success" type="submit" className="flex-grow-1" disabled={suppliers.length === 0}>Create Order</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default AdminDashboard;