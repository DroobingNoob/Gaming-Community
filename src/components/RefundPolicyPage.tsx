import React from 'react';
import { ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
            Understanding our cancellation and refund procedures for digital game purchases
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: January 2025
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 space-y-8">
          
          {/* Quick Summary */}
          <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <span>Important Notice</span>
            </h2>
            <div className="text-gray-700 space-y-3">
              <p className="font-semibold">
                Due to the digital nature of our products, all sales are generally final once the game key is delivered and activated.
              </p>
              <p>
                However, we understand that issues may arise, and we're committed to providing fair solutions for our customers.
              </p>
            </div>
          </section>

          {/* Section 1 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">1. Eligible Refund Scenarios</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                We provide full refunds in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Invalid Game Key:</strong> If the provided key doesn't work or is already used</li>
                <li><strong>Wrong Product:</strong> If you received a different game than ordered</li>
                <li><strong>Platform Mismatch:</strong> If the key is for wrong platform (PS4 instead of PS5, etc.)</li>
                <li><strong>Technical Issues:</strong> If our system error caused duplicate charges</li>
                <li><strong>Non-Delivery:</strong> If you don't receive your game key within 24 hours</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 font-semibold">
                  ✅ These issues are covered by our 100% money-back guarantee
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-red-400 to-pink-500 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">2. Non-Refundable Scenarios</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Refunds are not available in these situations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Change of Mind:</strong> After successful key activation</li>
                <li><strong>Game Performance:</strong> Issues with game quality, bugs, or gameplay</li>
                <li><strong>Hardware Compatibility:</strong> If your console doesn't meet game requirements</li>
                <li><strong>Regional Restrictions:</strong> If the game is restricted in your region</li>
                <li><strong>Account Issues:</strong> Problems with your PlayStation/Xbox account</li>
                <li><strong>Used Keys:</strong> If you've already activated and played the game</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 font-semibold">
                  ❌ These scenarios are not covered by our refund policy
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">3. Refund Timeline & Process</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3">Reporting Timeline</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Report issues within <strong>24 hours</strong> of purchase</li>
                    <li>• Provide order details and screenshots</li>
                    <li>• Contact via WhatsApp or email</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-green-800 mb-3">Processing Timeline</h3>
                  <ul className="space-y-2 text-green-700">
                    <li>• Investigation: <strong>1-2 hours</strong></li>
                    <li>• Approval: <strong>Same day</strong></li>
                    <li>• Refund processing: <strong>3-5 business days</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Refund Methods</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Refunds are processed using the same method as your original payment:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">UPI Payments</h4>
                  <p className="text-purple-700 text-sm">Instant refund to your UPI ID</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">Bank Transfer</h4>
                  <p className="text-orange-700 text-sm">3-5 business days to your account</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                  <h4 className="font-bold text-cyan-800 mb-2">Digital Wallets</h4>
                  <p className="text-cyan-700 text-sm">1-2 business days</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Cancellation Policy</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                You can cancel your order in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Before Delivery:</strong> Full refund if cancelled before key delivery</li>
                <li><strong>Payment Issues:</strong> If payment was processed but order wasn't confirmed</li>
                <li><strong>System Errors:</strong> If our system created duplicate orders</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Once a game key is delivered and you've received it, cancellation is not possible unless the key is defective.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. How to Request a Refund</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                To request a refund, follow these steps:
              </p>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <ol className="list-decimal list-inside space-y-3">
                  <li><strong>Contact Us Immediately:</strong> WhatsApp +91 92665 14434 or email psgamingcommunity@outlook.com</li>
                  <li><strong>Provide Order Details:</strong> Order number, payment screenshot, and issue description</li>
                  <li><strong>Submit Evidence:</strong> Screenshots of error messages or activation attempts</li>
                  <li><strong>Wait for Investigation:</strong> Our team will verify your claim within 2 hours</li>
                  <li><strong>Receive Confirmation:</strong> You'll get refund confirmation via WhatsApp/email</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Alternative Solutions</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Before processing refunds, we may offer alternative solutions:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Key Replacement:</strong> New working key for defective ones</li>
                <li><strong>Platform Exchange:</strong> Different platform version if available</li>
                <li><strong>Store Credit:</strong> Credit for future purchases with bonus value</li>
                <li><strong>Game Exchange:</strong> Different game of equal or lesser value</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Dispute Resolution</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                If you're not satisfied with our refund decision:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Request escalation to our senior support team</li>
                <li>Provide additional evidence if available</li>
                <li>We'll review your case within 24 hours</li>
                <li>Final decisions will be communicated in writing</li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Our customer support team is available 24/7 to assist with refund requests:
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
              This policy is designed to be fair to both customers and Gaming Community. We reserve the right to update this policy with advance notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;