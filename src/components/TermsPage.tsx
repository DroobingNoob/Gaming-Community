import React from 'react';
import { ArrowLeft, Clock, Shield, FileText, AlertTriangle, Users, Gamepad2 } from 'lucide-react';

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
          
          {/* Rental Terms Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Rental Terms & Conditions</h2>
            </div>

            {/* Rental Duration */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Rental Duration</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• All rentals are valid for <strong>30 days</strong> from the activation date.</p>
                <p>• If you wish to extend your rental, you must inform us at least <strong>7 days before the expiry date</strong>.</p>
              </div>
            </div>

            {/* Account Usage & Restrictions */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Account Usage & Restrictions</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• Do not change any login credentials or settings of the rental account.</p>
                <p>• The account is strictly for playing the rented game only. Any unauthorized activity will lead to access being <strong>revoked immediately without refund</strong>.</p>
              </div>
            </div>

            {/* Early Game Completion */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Early Game Completion</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• If you finish the game before the 30-day period, you can inform us to end the rental early.</p>
                <p>• Early return may qualify you for a <strong>special discount on your next rental</strong>.</p>
              </div>
            </div>

            {/* Account Return Process */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Account Return Process</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>After your rental ends, you must send a <strong>video proof</strong> showing:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The account has been logged out, and</li>
                  <li>The account has been deleted from your console.</li>
                </ul>
                <p>This step is <strong>mandatory for processing future rentals</strong>.</p>
              </div>
            </div>

            {/* Secure Communication */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Secure Communication</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• Always notify us when you stop playing or complete your game.</p>
                <p>• This helps us ensure seamless service and maintain your eligibility for future deals.</p>
              </div>
            </div>

            {/* Game Exchange Policy */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">6</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Game Exchange Policy</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• Game swaps are <strong>not allowed</strong> during an active rental.</p>
                <p>• If you want to switch to another game, request early completion and avail a discount on your next game.</p>
              </div>
            </div>
          </section>

          {/* Permanent Game Purchase Terms */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-lg">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Permanent Game Purchase Terms</h2>
            </div>

            {/* Warranty Coverage */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Warranty Coverage</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• All permanent games come with a <strong>6-month warranty</strong>.</p>
                <p>• If you face any lock/access issues during this time, we will provide support, and if necessary, offer a replacement or fix.</p>
              </div>
            </div>

            {/* Single-Device License */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Single-Device License</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• Games are licensed for <strong>one device only</strong>.</p>
                <p>• Account sharing, re-login on a second device, or unauthorized transfer will <strong>void the warranty</strong>.</p>
              </div>
            </div>

            {/* Platform Limitation */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Platform Limitation</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• The game is tied to the platform you chose (PS4 or PS5).</p>
                <p>• Switching platforms (e.g., PS4 to PS5) is <strong>not permitted</strong>, and licenses cannot be transferred.</p>
              </div>
            </div>

            {/* Device Stability */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Device Stability</h3>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-3 ml-12">
                <p>• Do not delete or alter the game/account files from your console.</p>
                <p>• If the account is removed before the warranty ends, <strong>support and warranty coverage become void</strong>.</p>
              </div>
            </div>
          </section>

          {/* Important Notices */}
          <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">Important Notices</h2>
            </div>
            <div className="text-gray-700 space-y-3">
              <p>• We provide <strong>legal, verified game accounts</strong> with secure, one-time setup and full guidance.</p>
              <p>• By using our service, you agree to follow all the rules outlined above.</p>
              <p>• These terms are in place to protect both the buyer and seller, and ensure a fair gaming experience.</p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                For questions about these terms or our services, contact us:
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
                Support Hours: 24/7 Available
              </p>
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