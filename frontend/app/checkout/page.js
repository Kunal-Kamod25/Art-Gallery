'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CheckCircle, Lock } from 'lucide-react';
import api from '../../lib/api';
import { useCartStore, useAuthStore } from '../../lib/store';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=shipping, 2=payment, 3=confirm
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '', street: '', city: '',
    state: '', postalCode: '', country: 'United States', phone: ''
  });
  const [payment, setPayment] = useState({ method: 'stripe', cardNumber: '4242 4242 4242 4242', expiry: '12/26', cvv: '123' });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Please sign in to checkout</h2>
        <Link href="/auth/login" className="btn-primary text-sm tracking-widest uppercase">Sign In</Link>
      </div>
    </div>
  );

  if (items.length === 0 && !placed) {
    router.push('/cart');
    return null;
  }

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const shippingCost = 150;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        orderItems: items.map(i => ({
          artwork: i._id, title: i.title,
          image: i.images?.find(x => x.isPrimary)?.url || i.images?.[0]?.url,
          price: i.price, artist: i.artist?.name
        })),
        shippingAddress: shipping,
        paymentMethod: payment.method,
        taxPrice: tax, shippingPrice: shippingCost, totalPrice: total,
        isPaid: true, paidAt: new Date()
      });
      setOrderId(res.data.order._id);
      clearCart();
      setPlaced(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (placed) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white px-6 text-center">
      <CheckCircle size={72} className="text-green-500 mb-6" />
      <h2 className="font-display text-4xl font-bold mb-3">Order Confirmed!</h2>
      <p className="text-neutral-500 mb-2">Thank you for your purchase.</p>
      <p className="text-sm text-neutral-400 mb-8">Order ID: <span className="font-mono text-neutral-700">{orderId}</span></p>
      <p className="text-neutral-600 max-w-md mb-8 text-sm">Your artwork(s) will be carefully packaged and shipped. You&apos;ll receive tracking information via email within 2 business days.</p>
      <div className="flex gap-4">
        <Link href="/orders" className="btn-outline text-sm tracking-widest uppercase">My Orders</Link>
        <Link href="/gallery" className="btn-primary text-sm tracking-widest uppercase">Continue Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-10 text-sm">
          {[['1', 'Shipping'], ['2', 'Payment'], ['3', 'Review']].map(([n, label]) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs ${step >= Number(n) ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}>{n}</div>
              <span className={step >= Number(n) ? 'font-medium' : 'text-neutral-400'}>{label}</span>
              {n !== '3' && <div className="w-8 h-px bg-neutral-300 ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-white border border-neutral-100 p-6">
                <h2 className="font-display text-xl font-bold mb-6">Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['fullName', 'Full Name', 'text', 'col-span-2'],
                    ['street', 'Street Address', 'text', 'col-span-2'],
                    ['city', 'City', 'text', ''],
                    ['state', 'State / Province', 'text', ''],
                    ['postalCode', 'Postal Code', 'text', ''],
                    ['country', 'Country', 'text', ''],
                    ['phone', 'Phone Number', 'tel', 'col-span-2'],
                  ].map(([key, label, type, cls]) => (
                    <div key={key} className={cls}>
                      <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">{label}</label>
                      <input type={type} value={shipping[key]}
                        onChange={e => setShipping(f => ({ ...f, [key]: e.target.value }))}
                        required className="input-field text-sm" />
                    </div>
                  ))}
                </div>
                <button onClick={() => { if (Object.values(shipping).slice(0, 6).every(Boolean)) setStep(2); else toast.error('Fill all required fields'); }}
                  className="btn-primary mt-6 text-sm tracking-widest uppercase w-full">Continue to Payment</button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white border border-neutral-100 p-6">
                <h2 className="font-display text-xl font-bold mb-6">Payment</h2>
                <div className="flex gap-4 mb-6">
                  {[['stripe', 'Credit Card'], ['bank_transfer', 'Bank Transfer']].map(([val, label]) => (
                    <button key={val} onClick={() => setPayment(f => ({ ...f, method: val }))}
                      className={`flex-1 py-3 text-sm border transition-all ${payment.method === val ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {payment.method === 'stripe' && (
                  <div className="space-y-4 bg-neutral-50 p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4"><Lock size={12} /> Secured by Stripe</div>
                    <div>
                      <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Card Number</label>
                      <input value={payment.cardNumber} onChange={e => setPayment(f => ({ ...f, cardNumber: e.target.value }))} className="input-field text-sm font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">Expiry</label>
                        <input value={payment.expiry} onChange={e => setPayment(f => ({ ...f, expiry: e.target.value }))} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-1">CVV</label>
                        <input value={payment.cvv} onChange={e => setPayment(f => ({ ...f, cvv: e.target.value }))} className="input-field text-sm" />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400">Test card: 4242 4242 4242 4242</p>
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 text-sm tracking-widest uppercase">Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 text-sm tracking-widest uppercase">Review Order</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white border border-neutral-100 p-6">
                <h2 className="font-display text-xl font-bold mb-6">Review Your Order</h2>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item._id} className="flex justify-between items-center text-sm py-2 border-b">
                      <span className="font-medium">{item.title}</span>
                      <span className="font-bold">${item.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-neutral-50 p-4 text-sm mb-6">
                  <p className="font-semibold mb-1">Shipping to:</p>
                  <p className="text-neutral-600">{shipping.fullName}, {shipping.street}, {shipping.city}, {shipping.state} {shipping.postalCode}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 text-sm tracking-widest uppercase">Back</button>
                  <button onClick={placeOrder} disabled={loading}
                    className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm tracking-widest uppercase disabled:opacity-50">
                    {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {loading ? 'Placing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-neutral-100 p-6 h-fit">
            <h3 className="font-display text-lg font-bold mb-4">Summary</h3>
            <div className="space-y-2 text-sm text-neutral-600 mb-4">
              <div className="flex justify-between"><span>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost}</span></div>
              <div className="flex justify-between"><span>Tax (18%)</span><span>₹{tax.toFixed(0)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base text-neutral-900">
                <span className="font-display">Total</span>
                <span className="font-display">₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
