import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  CreditCard, 
  Heart,
  Star,
  Crown,
  Gift,
  Zap,
  Smartphone,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';

const MPesaShowcasePlatform = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Donation packages
  const donationPackages = [
    {
      id: 'basic',
      name: 'Basic Appreciation',
      amount: 50,
      icon: <Heart className="w-6 h-6" />,
      description: 'Show basic support for our M-Pesa innovations',
      color: 'bg-gradient-to-r from-green-400 to-green-600',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Support',
      amount: 200,
      icon: <Star className="w-6 h-6" />,
      description: 'Premium support for continued development',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite Patron',
      amount: 500,
      icon: <Crown className="w-6 h-6" />,
      description: 'Elite level patronage for exceptional work',
      color: 'bg-gradient-to-r from-purple-400 to-purple-600',
      popular: false
    },
    {
      id: 'custom',
      name: 'Custom Amount',
      amount: 0,
      icon: <Gift className="w-6 h-6" />,
      description: 'Choose your own appreciation amount',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      popular: false
    }
  ];

  const handleDonation = async () => {
    if (!selectedPackage || !phoneNumber) {
      setPaymentStatus('Please select a package and enter your phone number');
      return;
    }

    const amount = selectedPackage.id === 'custom' ? parseInt(customAmount) : selectedPackage.amount;
    
    if (!amount || amount < 1) {
      setPaymentStatus('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Initiating STK Push...');

    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: amount,
          packageName: selectedPackage.name,
          description: `MPesa Pro Donation - ${selectedPackage.name}`
        })
      });

      const result = await response.json();

      if (result.success) {
        setPaymentStatus('STK Push sent! Check your phone for M-Pesa prompt 📱');
        setTimeout(() => {
          setPaymentStatus('Thank you for your support! 🎉');
        }, 10000);
      } else {
        setPaymentStatus(`Payment failed: ${result.message}`);
      }
    } catch (error) {
      setPaymentStatus('Error processing payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                MPesa Pro
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentSection('home')}
                className={`font-medium transition-colors ${currentSection === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentSection('donate')}
                className={`font-medium transition-colors ${currentSection === 'donate' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}
              >
                Donate
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => { setCurrentSection('home'); setIsMenuOpen(false); }}
                className="block px-3 py-2 text-gray-700 hover:text-green-600 w-full text-left"
              >
                Home
              </button>
              <button 
                onClick={() => { setCurrentSection('donate'); setIsMenuOpen(false); }}
                className="block px-3 py-2 text-gray-700 hover:text-green-600 w-full text-left"
              >
                Donate
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent">
                M-Pesa Integration
              </span>
              <br />
              <span className="text-gray-800">Mastery</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Level up your online transactions with <strong>just one push of a button</strong>. 
              No more manual paybill entries, no more customer friction. 
              Experience seamless M-Pesa integration that converts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={() => setCurrentSection('donate')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Experience STK Push</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">&lt;3s</div>
                <div className="text-gray-600">Transaction Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Section */}
      {currentSection === 'donate' && (
        <div className="py-20 bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Support Our M-Pesa Innovation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Help us continue building world-class payment solutions. Experience our STK Push integration firsthand!
              </p>
            </div>

            {/* Package Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {donationPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedPackage?.id === pkg.id
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className={`${pkg.color} text-white p-3 rounded-full w-fit mx-auto mb-4`}>
                    {pkg.icon}
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">{pkg.name}</h3>
                  <p className="text-center text-2xl font-bold text-green-600 mb-2">
                    {pkg.id === 'custom' ? 'Custom' : `KSh ${pkg.amount}`}
                  </p>
                  <p className="text-sm text-gray-600 text-center">{pkg.description}</p>
                </div>
              ))}
            </div>

            {/* Custom Amount Input */}
            {selectedPackage?.id === 'custom' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Custom Amount (KSh)
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  min="10"
                />
              </div>
            )}

            {/* Phone Number Input */}
            {selectedPackage && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678 or 254712345678"
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your Safaricom number to receive the STK push
                </p>
              </div>
            )}

            {/* Payment Button */}
            {selectedPackage && (
              <div className="text-center mb-6">
                <button
                  onClick={handleDonation}
                  disabled={isProcessing || !phoneNumber}
                  className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all transform hover:scale-105 ${
                    isProcessing || !phoneNumber
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mr-3" />
                  {isProcessing ? 'Processing...' : 
                   `Pay KSh ${selectedPackage.id === 'custom' ? customAmount || '0' : selectedPackage.amount} via M-Pesa`}
                </button>
              </div>
            )}

            {/* Payment Status */}
            {paymentStatus && (
              <div className={`p-6 rounded-xl text-center text-lg font-medium ${
                paymentStatus.includes('successful') || paymentStatus.includes('🎉')
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : paymentStatus.includes('Check your phone')
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {paymentStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">MPesa Pro</span>
            </div>
            <p className="text-gray-300 mb-4">
              Revolutionizing online transactions with seamless M-Pesa integration.
            </p>
            <p className="text-gray-400">
              &copy; 2024 MPesa Pro. Built with ❤️ for seamless payments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MPesaShowcasePlatform;
