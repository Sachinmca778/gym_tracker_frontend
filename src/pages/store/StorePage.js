import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, Search, Filter, Plus, Edit2, Trash2, Eye, 
  TrendingUp, AlertTriangle, Package, DollarSign, RefreshCw,
  X, Minus, Plus as PlusIcon, Trash, CreditCard, Truck
} from 'lucide-react';

// ===== PRODUCT CARD =====
function ProductCard({ product, onAddToCart, isAdmin }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="card card-interactive animate-fadeInUp"
      style={{ padding: 0, overflow: 'hidden' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div style={{ 
        height: '200px', 
        background: 'var(--bg-elevated)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Package size={64} color="var(--text-tertiary)" />
        )}
        
        {/* Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
          {product.isFeatured && (
            <span className="badge badge-info" style={{ fontSize: '11px' }}>Featured</span>
          )}
          {product.discountPercentage > 0 && (
            <span className="badge badge-success" style={{ fontSize: '11px' }}>
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        {isHovered && (
          <div style={{ 
            position: 'absolute', 
            bottom: '12px', 
            right: '12px', 
            display: 'flex', 
            gap: '8px' 
          }}>
            {isAdmin && (
              <>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ background: 'white' }}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ background: 'white', color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onAddToCart(product)}
              disabled={product.stockQuantity <= 0}
            >
              <ShoppingCart size={14} />
              {product.stockQuantity > 0 ? 'Add' : 'Out of Stock'}
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent-primary-light)', marginBottom: '4px' }}>
          {product.categoryName || 'General'}
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>
            ₹{(product.effectivePrice || product.price || 0).toLocaleString()}
          </span>
          {product.memberPrice && (
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
              ₹{product.price?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ color: product.isOutOfStock ? 'var(--danger)' : product.isLowStock ? 'var(--warning)' : 'var(--success)' }}>
            {product.isOutOfStock ? 'Out of Stock' : product.isLowStock ? 'Low Stock' : `In Stock (${product.stockQuantity})`}
          </span>
          {product.unit && (
            <span style={{ color: 'var(--text-tertiary)' }}>per {product.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== SHOPPING CART SIDEBAR =====
function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="modal-overlay"
        style={{ zIndex: 1000 }}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '400px',
        background: 'var(--bg-primary)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Shopping Cart</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.items.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
              <p style={{ color: 'var(--text-tertiary)' }}>Your cart is empty</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.items.map((item, index) => (
                <div key={item.productId} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  padding: '12px', 
                  background: 'var(--bg-elevated)',
                  borderRadius: '10px'
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '8px', 
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <Package size={24} color="var(--text-tertiary)" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.productName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                      ₹{item.unitPrice?.toLocaleString()} × {item.quantity}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      >
                        <PlusIcon size={14} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ marginLeft: 'auto', color: 'var(--danger)' }}
                        onClick={() => onRemove(item.productId)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '14px' }}>
                    ₹{item.total?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div style={{ 
            padding: '20px', 
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{cart.subtotal?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Tax</span>
              <span style={{ fontWeight: 600 }}>₹{cart.tax?.toLocaleString() || '0'}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '16px', 
              fontSize: '18px', 
              fontWeight: 800 
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--success)' }}>₹{cart.total?.toLocaleString()}</span>
            </div>
            <button 
              className="btn btn-primary btn-lg btn-full"
              onClick={onCheckout}
            >
              <CreditCard size={18} /> Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ===== MAIN STORE PAGE =====
export default function StorePage() {
  const { user, isAdmin, isStaff, isMember } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState({ items: [], subtotal: 0, tax: 0, total: 0, totalItems: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (isAdmin || isStaff) {
      fetchStats();
    }
  }, [selectedCategory, page]);

  const fetchCategories = async () => {
    try {
      // API call here
      // const { data } = await storeAPI.getCategories(user?.gymId);
      // setCategories(data);
      
      // Mock data for now
      setCategories([
        { id: 1, name: 'Supplements', icon: '💊' },
        { id: 2, name: 'Protein', icon: '🥤' },
        { id: 3, name: 'Apparel', icon: '👕' },
        { id: 4, name: 'Accessories', icon: '🎽' },
      ]);
    } catch (error) {
      console.error('Categories fetch error:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // API call here
      // const { data } = await storeAPI.getProducts(user?.gymId, selectedCategory, page, 10);
      // setProducts(data.content || []);
      // setTotalPages(data.totalPages || 1);

      // Mock data for now
      setProducts([
        {
          id: 1,
          name: 'Whey Protein Concentrate',
          description: 'Premium quality whey protein for muscle building',
          price: 2999,
          memberPrice: 2699,
          effectivePrice: 2699,
          stockQuantity: 50,
          minStockLevel: 10,
          categoryName: 'Protein',
          imageUrl: null,
          isFeatured: true,
          discountPercentage: 10,
          unit: 'kg'
        },
        {
          id: 2,
          name: 'BCAA Powder',
          description: 'Branch chain amino acids for recovery',
          price: 1499,
          memberPrice: 1299,
          effectivePrice: 1299,
          stockQuantity: 5,
          minStockLevel: 10,
          categoryName: 'Supplements',
          imageUrl: null,
          isFeatured: false,
          discountPercentage: 0,
          unit: '250g'
        },
        {
          id: 3,
          name: 'Gym T-Shirt',
          description: 'Breathable cotton t-shirt for workouts',
          price: 799,
          memberPrice: 699,
          effectivePrice: 699,
          stockQuantity: 100,
          minStockLevel: 20,
          categoryName: 'Apparel',
          imageUrl: null,
          isFeatured: false,
          discountPercentage: 0,
          unit: 'piece'
        },
      ]);
    } catch (error) {
      console.error('Products fetch error:', error);
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      // API call here
      // const { data } = await storeAPI.getStatistics(user?.gymId);
      // setStats(data);
      
      setStats({
        totalRevenue: 45000,
        totalOrders: 28,
        lowStockCount: 3,
        totalProducts: 45
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.productId === product.id);
      let newItems;
      
      if (existingItem) {
        newItems = prevCart.items.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prevCart.items, {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          unitPrice: product.price,
          memberPrice: product.memberPrice,
          discountPercentage: product.discountPercentage,
          imageUrl: product.imageUrl,
          isMember: isMember,
          total: product.effectivePrice || product.price
        }];
      }
      
      // Calculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + tax;
      
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        tax,
        total,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
    
    toast.success('Added to cart! 🛒');
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity: newQuantity, total: item.unitPrice * newQuantity };
        }
        return item;
      });
      
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        tax,
        total,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.productId !== productId);
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        tax,
        total,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  };

  const handleCheckout = () => {
    toast.success('Checkout feature coming soon! 🚀');
    // Implement checkout logic here
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Gym Store</h1>
          <p className="page-subtitle">Premium supplements, apparel & accessories</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetchProducts}>
            <RefreshCw size={16} />
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={16} /> Cart
            {cart.totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cart.totalItems}
              </span>
            )}
          </button>
          {isAdmin && (
            <button className="btn btn-secondary">
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards (Admin/Staff only) */}
      {(isAdmin || isStaff) && stats && (
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <div className="stat-card animate-fadeInUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Total Revenue</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <DollarSign size={24} />
              </div>
            </div>
          </div>
          
          <div className="stat-card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--info)' }}>
                  {stats.totalOrders || 0}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Total Orders</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--info-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                <Package size={24} />
              </div>
            </div>
          </div>
          
          <div className="stat-card animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning)' }}>
                  {stats.lowStockCount || 0}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Low Stock Items</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--warning-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
          
          <div className="stat-card animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {stats.totalProducts || 0}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Total Products</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        
        {/* Categories Sidebar */}
        <div className="card animate-fadeInUp" style={{ padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Categories
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-ghost'} btn-sm btn-full`}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </button>
            
            {categories.map((category, index) => (
              <button
                key={category.id}
                className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-ghost'} btn-sm btn-full`}
                onClick={() => setSelectedCategory(category.id)}
                style={{ justifyContent: 'flex-start' }}
              >
                <span style={{ marginRight: '8px' }}>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                className="input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ padding: 0 }}>
                  <div className="skeleton" style={{ height: '200px' }} />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
              <h4>No products found</h4>
              <p style={{ color: 'var(--text-tertiary)' }}>Try a different category or search term</p>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    memberPrice: PropTypes.number,
    effectivePrice: PropTypes.number,
    stockQuantity: PropTypes.number,
    minStockLevel: PropTypes.number,
    categoryName: PropTypes.string,
    imageUrl: PropTypes.string,
    isFeatured: PropTypes.bool,
    discountPercentage: PropTypes.number,
    unit: PropTypes.string
  }),
  onAddToCart: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool
};

CartSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cart: PropTypes.shape({
    items: PropTypes.array,
    subtotal: PropTypes.number,
    tax: PropTypes.number,
    total: PropTypes.number,
    totalItems: PropTypes.number
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired
};
