import React from 'react';
import { ArrowLeft, Shield, FileText, Clock, Users } from 'lucide-react';

interface TermsPageProps {
  onBackToHome: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBackToHome }) => {
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
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our gaming services
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: January 2025
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 space-y-8">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">1. Acceptance of Terms</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                By accessing and using Gaming Community's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These terms apply to all visitors, users, and others who access or use our gaming platform and digital game distribution services.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">2. Digital Game Licenses</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                All digital games sold through Gaming Community are legitimate licenses obtained from authorized distributors. When you purchase a game, you receive:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>A valid digital license key for the specified platform (PS4/PS5)</li>
                <li>Instant delivery within 5 minutes of payment confirmation</li>
                <li>24/7 customer support for any activation issues</li>
                <li>Lifetime warranty on all game keys</li>
              </ul>
              <p>
                Game keys are region-specific and intended for use in India. International usage may be restricted based on publisher policies.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">3. Payment & Pricing</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                All prices are listed in Indian Rupees (₹) and include applicable taxes. We accept various payment methods including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>UPI payments (Google Pay, PhonePe, Paytm)</li>
                <li>Bank transfers (NEFT/RTGS/IMPS)</li>
                <li>Digital wallets</li>
                <li>Credit/Debit cards</li>
              </ul>
              <p>
                Prices may change without notice. However, orders placed before price changes will be honored at the original price.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Account Responsibilities</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Users are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing accurate contact information for order delivery</li>
                <li>Securing their gaming platform accounts</li>
                <li>Not sharing or reselling purchased game keys</li>
                <li>Reporting any issues within 24 hours of purchase</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Delivery & Activation</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Digital game keys are delivered via:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>WhatsApp message to your registered number</li>
                <li>Email to your provided email address</li>
                <li>Direct message through our customer support</li>
              </ul>
              <p>
                Delivery typically occurs within 5 minutes of payment confirmation. During peak hours or holidays, delivery may take up to 2 hours.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Prohibited Activities</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Attempting to resell or redistribute purchased game keys</li>
                <li>Using fraudulent payment methods</li>
                <li>Creating multiple accounts to abuse promotional offers</li>
                <li>Attempting to reverse engineer or hack our systems</li>
                <li>Harassing our customer support staff</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Gaming Community shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Issues arising from platform-specific restrictions</li>
                <li>Changes in game availability by publishers</li>
                <li>Technical issues with gaming platforms</li>
                <li>Loss of game progress or saved data</li>
              </ul>
              <p>
                Our maximum liability is limited to the purchase price of the affected game.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Privacy & Data Protection</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                We collect and process personal information in accordance with Indian data protection laws. Your information is used solely for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processing and delivering your orders</li>
                <li>Providing customer support</li>
                <li>Sending important service updates</li>
                <li>Improving our services</li>
              </ul>
              <p>
                We do not sell or share your personal information with third parties for marketing purposes.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Modifications to Terms</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Gaming Community reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
              <p>
                We will notify users of significant changes via email or WhatsApp when possible.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Contact Information</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                For questions about these terms or our services, contact us:
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <span className="font-semibold">WhatsApp:</span>
                    <span>+91 92665 14434</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="font-semibold">Email:</span>
                    <span>psgamingcommunity@outlook.com</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="font-semibold">Support Hours:</span>
                    <span>24/7 Available</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              By using Gaming Community services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;