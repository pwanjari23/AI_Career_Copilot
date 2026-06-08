import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, Receipt, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Button';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
  
  const orderId = searchParams.get('order_id');
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null); // 'PAID', 'FAILED', 'PENDING'
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const verifyTransaction = async () => {
      if (verifiedRef.current) return;
      verifiedRef.current = true;

      if (!orderId) {
        setError('Missing transaction identifiers.');
        setVerifying(false);
        return;
      }

      try {
        setVerifying(true);
        setError(null);

        // Fetch verification state
        const response = await api.post('/payments/verify', { orderId });
        
        if (response.data.success) {
          const checkStatus = response.data.data.status;
          setStatus(checkStatus);
          
          if (checkStatus === 'PAID') {
            // Update local user state immediately by fetching profile
            const profileRes = await api.get('/auth/profile');
            if (profileRes.data.success) {
              updateUserProfile(profileRes.data.data);
            }
            setRedirecting(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2500);
          }
        } else {
          setStatus('FAILED');
          setError(response.data.message || 'Payment verification failed.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('FAILED');
        setError(err.response?.data?.message || 'Server network timed out during verification.');
      } finally {
        setVerifying(false);
      }
    };

    verifyTransaction();
  }, [orderId, updateUserProfile, navigate]);

  if (verifying) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute h-16 w-16 rounded-full border-4 border-primary-500/20 animate-pulse-slow" />
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold font-sans">Verifying payment status...</h2>
        <p className="text-xs text-gray-400 mt-2">Please do not refresh this page or click back.</p>
      </div>
    );
  }

  const isSuccess = status === 'PAID';

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-lg glass-card p-8 rounded-3xl border border-gray-200/40 dark:border-gray-800/40 bg-white dark:bg-darkCard shadow-2xl relative text-center">
        
        {/* Background visual highlight */}
        <div className={`absolute top-[-30px] left-1/2 transform -translate-x-1/2 h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${
          isSuccess 
            ? 'bg-emerald-500 text-white shadow-emerald-500/25' 
            : 'bg-red-500 text-white shadow-red-500/25'
        }`}>
          {isSuccess ? <CheckCircle2 className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-black font-sans tracking-tight mb-2">
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {isSuccess 
              ? 'Thank you for your purchase! Your account has been upgraded to Pro access.' 
              : error || 'Your transaction could not be processed. Please check details and try again.'}
          </p>
          {isSuccess && redirecting && (
            <p className="text-xs text-emerald-500 font-bold mt-3 animate-pulse flex items-center justify-center space-x-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Redirecting to your dashboard...</span>
            </p>
          )}
        </div>

        {/* Invoice details section */}
        <div className="my-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-150/20 dark:border-gray-800/40 text-left space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-200/40 dark:border-gray-800/40">
            <Receipt className="h-4 w-4" />
            <span>Transaction Details</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-450 dark:text-gray-400 font-light">Order ID:</span>
            <span className="font-mono font-semibold text-gray-700 dark:text-gray-200 max-w-[180px] truncate">{orderId}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-450 dark:text-gray-400 font-light">Status:</span>
            <span className={`font-bold uppercase ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
              {isSuccess ? 'PAID' : 'FAILED'}
            </span>
          </div>

          <div className="flex justify-between text-xs pt-1.5 border-t border-gray-200/40 dark:border-gray-800/40">
            <span className="text-gray-450 dark:text-gray-400 font-bold">Total Charged:</span>
            <span className="font-extrabold text-primary-500 text-sm font-sans">₹1,499.00</span>
          </div>
        </div>

        {/* Pro features notification */}
        {isSuccess && (
          <div className="mb-8 p-3.5 rounded-2xl bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border border-primary-500/20 flex items-start space-x-3 text-left">
            <Sparkles className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-gray-800 dark:text-white">Pro Privileges Granted</div>
              <p className="text-[10px] text-gray-400 font-light mt-0.5 leading-relaxed">
                You now have unlimited resume scoring, job matches, roadmap generations, and chatbot interactions.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard/Try again buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {isSuccess ? (
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                onClick={() => navigate('/checkout')}
                className="flex-1 py-3 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-white font-bold border border-gray-250/20 dark:border-gray-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Payment
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold"
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentStatus;
