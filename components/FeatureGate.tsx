import React from 'react';
import { Lock, Crown, ArrowUpCircle } from 'lucide-react';

interface FeatureGateProps {
  currentPlan: string;
  requiredPlans: string[];
  children: React.ReactNode;
  title?: string;
  description?: string;
  features?: string[];
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  currentPlan, 
  requiredPlans, 
  children,
  title = "Unlock Premium Features",
  description = "Upgrade your plan to access this feature.",
  features = []
}) => {
  const isAllowed = requiredPlans.some(p => p.toLowerCase() === currentPlan.toLowerCase()) || currentPlan.toLowerCase() === 'enterprise';

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200">
      <div className="max-w-md text-center">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {features.length > 0 && (
          <ul className="text-left bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 space-y-3">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                <Crown size={16} className="text-amber-500" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto">
          <ArrowUpCircle size={20} />
          Upgrade to {requiredPlans[0]}
        </button>
      </div>
    </div>
  );
};