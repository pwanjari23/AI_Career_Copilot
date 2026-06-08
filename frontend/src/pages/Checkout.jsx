import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Lock, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Mock Form States
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [cardName, setCardName] = useState('Professional Developer');

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await api.post('/payments/create-order');
        
        if (response.data.success) {
          if (response.data.data.isPro) {
            // Already Pro
            navigate('/dashboard');
            return;
          }
          setOrderData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to initialize payment.');
        }
      } catch (err) {
        console.error('Error creating payment order:', err);
        setError(err.response?.data?.message || 'Error communicating with server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeOrder();
  }, [navigate]);

  const handleRealCheckout = () => {
    if (!orderData || !orderData.paymentSessionId) return;
    setCheckoutLoading(true);
    try {
      const cashfree = window.Cashfree({
        mode: 'sandbox', // sandbox or production
      });
      cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      console.error('Cashfree SDK initiation failed:', err);
      setError('Unable to load Cashfree Payment Gateway. Verify that index.html script is active.');
      setCheckoutLoading(false);
    }
  };

  const handleMockCheckout = async (simulateStatus) => {
    if (!orderData || !orderData.orderId) return;
    setCheckoutLoading(true);
    try {
      // Direct post verify with simulateStatus on mock sandbox
      await api.post('/payments/verify', {
        orderId: orderData.orderId,
        simulateStatus: simulateStatus,
      });

      // Redirect to status page
      navigate(`/payment-status?order_id=${orderData.orderId}`);
    } catch (err) {
      console.error('Mock verification check failed:', err);
      setError('Simulated verification endpoint error.');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
          Preparing your secure checkout portal...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto px-4">
      {/* Brand Header */}
      <div className="text-center md:text-left mb-8">
        <h1 className="text-2xl md:text-3xl font-black font-sans tracking-tight text-gray-900 dark:text-white flex items-center justify-center md:justify-start space-x-2">
          <span>Upgrade to CareerCopilot Pro</span>
          <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Unlock unlimited access and get the ultimate career edge.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-3 border border-red-200/50 dark:border-red-900/50">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Summary of Pro benefits */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-card p-6 rounded-2xl border border-gray-200/40 dark:border-gray-800/40 bg-white/50 dark:bg-darkCard/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Order Summary</h2>
            <p className="text-xs text-gray-400 font-light mb-4">Flat-rate plan with lifetime career value.</p>
            
            <div className="py-4 border-y border-gray-250/20 dark:border-gray-800/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pro Subscription (Flat rate)</span>
                <span className="text-lg font-extrabold text-primary-500 font-sans">₹1,499.00</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Approx. $18.99 USD. Taxes and fees included.</p>
            </div>

            <ul className="mt-6 space-y-4 text-xs font-medium text-gray-600 dark:text-gray-300">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Unlimited automated AI resume analysis</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Unlimited job matching and mock interviews</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Unrestricted Gemini career assistant access</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Premium visual learning roadmaps (6-Months)</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-250/20 dark:border-gray-800/50 flex items-center space-x-2 text-xs text-gray-400">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>Secure 256-bit payment integration.</span>
          </div>
        </div>

        {/* Right: Payment Processor Card */}
        <div className="lg:col-span-7">
          {orderData?.isMock ? (
            /* Premium Mock Card Simulation Box */
            <div className="glass-card p-6 rounded-2xl border-2 border-primary-500 bg-white dark:bg-darkCard shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
              {/* Simulator Indicator Bar */}
              <div className="absolute top-0 left-0 right-0 py-1 bg-gradient-to-r from-primary-600 to-indigo-500 text-[10px] uppercase font-bold tracking-widest text-center text-white">
                Payment Simulator Sandbox fallback
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold mb-1 mt-2">Mock Checkout Interface</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  No Cashfree credentials found in `.env`. Simulate payments locally.
                </p>

                {/* Credit Card Graphic */}
                <div className="w-full max-w-sm mx-auto mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-primary-800 text-white shadow-lg relative aspect-[1.58/1]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-8 w-11 bg-yellow-400/80 rounded-md opacity-80" /> {/* Chip */}
                    <div className="text-xs font-black italic uppercase tracking-wider">MOCK GATEWAY</div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-lg font-mono tracking-widest">{cardNumber}</div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <div className="text-[8px] uppercase font-light text-gray-300">Card Holder</div>
                        <div className="font-semibold tracking-wide uppercase">{cardName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] uppercase font-light text-gray-300">Expires</div>
                        <div className="font-mono">{cardExpiry}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator Card Controls */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Order Identifier</label>
                      <input
                        type="text"
                        disabled
                        value={orderData?.orderId || ''}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/30 text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => handleMockCheckout('SUCCESS')}
                  loading={checkoutLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Simulate Success
                </Button>
                <Button
                  onClick={() => handleMockCheckout('FAILURE')}
                  loading={checkoutLoading}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Simulate Failure
                </Button>
              </div>
            </div>
          ) : (
            /* Cashfree Secure Portal Initializer */
            <div className="glass-card p-6 rounded-2xl border border-gray-250/20 dark:border-gray-800/80 bg-white dark:bg-darkCard shadow-lg flex flex-col justify-between h-full min-h-[400px]">
              <div>
                <h3 className="text-lg font-bold mb-1">Cashfree Payment Portal</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Proceed to verify your credentials and launch the secure Cashfree Checkout sandbox.
                </p>

                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 mb-6 flex items-start space-x-3 text-xs text-primary-700 dark:text-primary-300">
                  <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary-500" />
                  <div>
                    <span className="font-bold">Sandbox Environment Active:</span> You are utilizing our developer sandbox environment. Use any standard Cashfree sandbox test card or UPI credential details to verify the integration successfully.
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRealCheckout}
                loading={checkoutLoading}
                className="w-full py-4 text-sm font-extrabold uppercase bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all tracking-wider"
              >
                Launch Secure Cashfree Gateway
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
