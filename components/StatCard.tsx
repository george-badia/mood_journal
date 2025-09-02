
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <p className="text-3xl font-bold text-brand-primary mt-2">{value}</p>
    </div>
  );
};

export default StatCard;
