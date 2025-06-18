import React from 'react';
import { ArrowLeft, RefreshCw, XCircle, AlertTriangle, Clock, Shield } from 'lucide-react';

interface RefundPolicyPageProps {
  onBackToHome: () => void;
}

const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-8 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Cancellation & Refund Policy
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Understanding our cancellation and refund procedures for digital game purchases and rentals
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: January 2025
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 space-y-8">
          
          {/* Important Notice */}
          <section className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span>Important Notice</span>
            </h2>
            <div className="text-gray-700 space-y-3">
              <p className="font-semibold text-red-800">
                All purchases and rentals are non-refundable.
              </p>
              <p>
                Once the game/account is activated and delivered, we do not accept cancellation or refund requests for any reason.
              </p>
            </div>
          </section>

          {/* Post-Warranty Policy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Post-Warranty Policy</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                After the <strong>6-month period</strong>, any lock or access issues will not be covered, and <strong>no refund or replacement will be available</strong>.
              </p>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-red-400 to-pink-500 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Refund Policy</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>All purchases and rentals are non-refundable.</strong></span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Once the game/account is activated and delivered, we do not accept cancellation or refund requests for any reason.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span>In case of early game completion for rentals, you may qualify for a <strong>discount on your next rental</strong> - but no refund will be issued.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Rental Specific Terms */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Rental Specific Terms</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="font-bold text-orange-800 mb-3">Early Game Completion Benefits</h3>
                <ul className="space-y-2 text-orange-700">
                  <li>• If you complete a rental game early, inform us immediately</li>
                  <li>• You may qualify for a <strong>special discount on your next rental</strong></li>
                  <li>• This is a courtesy benefit, not a refund or credit</li>
                  <li>• Discount eligibility is at our discretion based on rental history</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Permanent Purchase Terms */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Permanent Purchase Terms</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-800 mb-3">6-Month Warranty Coverage</h3>
                <ul className="space-y-2 text-green-700">
                  <li>• All permanent games include a 6-month warranty period</li>
                  <li>• Warranty covers lock/access issues only</li>
                  <li>• We provide support, replacement, or fixes during warranty period</li>
                  <li>• Warranty becomes void if account is shared or transferred</li>
                  <li>• After 6 months, no support or replacements are available</li>
                </ul>
              </div>
            </div>
          </section>

          {/* What Voids Your Warranty/Service */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What Voids Your Warranty/Service</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-yellow-800 mb-3">Actions That Void Coverage</h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Changing login credentials or account settings</li>
                  <li>• Sharing account with others or logging in on multiple devices</li>
                  <li>• Deleting or altering game/account files from console</li>
                  <li>• Using account for unauthorized activities</li>
                  <li>• Attempting to transfer or resell the account</li>
                  <li>• Removing account from console before warranty ends</li>
                </ul>
              </div>
            </div>
          </section>

          {/* No Exceptions Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Exceptions Policy</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <p className="text-gray-700 font-semibold mb-3">
                  We maintain a strict no-refund policy for the following reasons:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Digital products cannot be "returned" once delivered</li>
                  <li>• Account access is immediately provided upon payment</li>
                  <li>• Our pricing reflects the no-refund policy</li>
                  <li>• This policy protects both buyers and sellers</li>
                  <li>• All terms are clearly stated before purchase</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Customer Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Responsibilities</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                To ensure the best service experience:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Read all terms carefully before making a purchase</li>
                <li>Ensure your console meets game requirements</li>
                <li>Follow all account usage guidelines strictly</li>
                <li>Contact support immediately if you encounter issues</li>
                <li>Provide video proof for rental returns as required</li>
                <li>Communicate with us about game completion or issues</li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Support?</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                While we cannot offer refunds, our support team is available 24/7 to help with technical issues:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">WhatsApp:</span>
                  <span>+91 92665 14434</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">Email:</span>
                  <span>psgamingcommunity@outlook.com</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Average response time: Under 30 minutes
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              This policy is firm and non-negotiable. By making a purchase, you acknowledge and accept these terms completely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;