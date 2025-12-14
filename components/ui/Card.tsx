import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = "", ...props }: CardProps) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className="px-6 py-4 border-b border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
  </div>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = ({ children, className = "", ...props }: CardContentProps) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);