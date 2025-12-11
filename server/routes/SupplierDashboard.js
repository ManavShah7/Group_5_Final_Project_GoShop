import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card } from 'react-bootstrap';
import axios from 'axios';

function SupplierDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/supplier-orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/supplier-orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      alert('Status updated successfully!');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f5f5f5',
          borderTop: '3px solid #000',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#737373' }}>Loading orders...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', color: '#171717' }}>
        Supplier Dashboard
      </h2>

      {orders.length === 0 ? (
        <Card style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>No orders yet</h4>
          <p style={{ color: '#737373' }}>Orders from admins will appear here</p>
        </Card>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
          <Table responsive style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Admin</th>
                <th>Products</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: '600' }}>#{order._id.substring(0, 8)}</td>
                  <td>{order.admin?.name || 'N/A'}</td>
                  <td>
                    {order.products.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        • {item.product?.name || 'N/A'} × {item.quantity} (@${item.costPrice})
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: '700', fontSize: '1.05rem' }}>${order.totalCost.toFixed(2)}</td>
                  <td>
                    <Badge bg={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                  </td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    {order.status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateStatus(order._id, 'confirmed')}
                        style={{ fontWeight: '600' }}
                      >
                        ✓ Confirm
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatus(order._id, 'shipped')}
                        style={{ fontWeight: '600' }}
                      >
                        🚚 Ship
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>
                        ✓ Shipped
                      </span>
                    )}
                    {order.status === 'delivered' && (
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
                        ✓ Delivered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default SupplierDashboard;