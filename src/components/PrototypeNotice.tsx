import React from 'react';
import { Info } from 'lucide-react';

export const PrototypeNotice: React.FC = () => {
  return (
    <div className="prototype-notice-bar">
      <span className="prototype-tag">Stage 1 Prototype</span>
      <Info size={16} color="var(--primary-blue)" />
      <span>
        Medical Laboratory & Diagnostic Portal Preview — Authentication and services use mock state for demonstration.
      </span>
    </div>
  );
};
