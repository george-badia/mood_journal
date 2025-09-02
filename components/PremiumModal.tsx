
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { processMpesaPayment } from '../services/intersendService';
import { CrownIcon, CloseIcon } from '../constants';

interface PremiumModalProps {
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { upgradeToPremium } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await processMpesaPayment(phoneNumber, 500); // Mock amount KES 500
      upgradeToPremium();
      setSuccess(true);
      setTimeout(() => {
          onClose();
      }, 2000); // Close modal after 2 seconds on success
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative transform transition-all duration-300 scale-100 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <CloseIcon />
        </button>

        {success ? (
          <div className="space-y-4">
            <CrownIcon className="mx-auto h-16 w-16 text-brand-secondary" />
            <h2 className="text-3xl font-bold text-gray-800">Welcome to Premium!</h2>
            <p className="text-gray-600">Your account has been upgraded. You now have access to all premium features. Happy journaling!</p>
          </div>
        ) : (
          <>
            <CrownIcon className="mx-auto h-12 w-12 text-brand-primary" />
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Go Premium</h2>
            <p className="text-gray-600 mt-2 mb-6">
              Unlock powerful features like PDF reporting to supercharge your mental wellness journey.
            </p>

            <div className="bg-indigo-50 p-4 rounded-lg text-left mb-6">
                <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center"><span className="text-brand-secondary mr-2">✔</span> Clinician-Grade PDF Reports</li>
                    <li className="flex items-center"><span className="text-brand-secondary mr-2">✔</span> Unlimited Media Uploads</li>
                    <li className="flex items-center"><span className="text-brand-secondary mr-2">✔</span> Advanced AI Insights</li>
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center">
                    <p className="font-bold text-4xl text-brand-primary">KES 500</p>
                    <p className="text-gray-500">One-time payment</p>
                </div>
                
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
                  placeholder=" "
                  required
                  disabled={loading}
                />
                <label 
                  htmlFor="phone" 
                  className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
                >
                  M-Pesa Phone Number (e.g. 0712345678)
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 bg-brand-secondary text-white font-bold rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors duration-300 disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  `Pay with M-Pesa`
                )}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4">Powered by InterSend</p>
          </>
        )}
      </div>
       <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PremiumModal;