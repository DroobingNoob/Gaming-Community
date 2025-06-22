import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Gaming Controller */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className={`${sizeClasses[size]} border-4 border-transparent border-t-cyan-400 border-r-orange-500 rounded-full animate-spin`}></div>
          
          {/* Inner pulsing controller */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-full animate-pulse shadow-lg">
              <Gamepad2 className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
            </div>
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading message */}
        <div className="text-center">
          <p className={`${textSizeClasses[size]} font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent`}>
            {message}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Fetching the best gaming deals...
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Background pattern for full screen loader */}
      {fullScreen && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Loader;