import React from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bus,
  Fuel,
  ShoppingCart,
  Zap,
  Home,
  GraduationCap,
  HeartPulse,
  Film,
  Plane,
  Wifi,
  Tv,
  User,
  Landmark,
  TrendingUp,
  Gift,
  Briefcase,
  Laptop,
  Coffee,
  Car,
  Smartphone,
  Tag,
  CreditCard,
  MoreHorizontal,
  CircleDollarSign,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';

interface CategoryIconProps {
  categoryName?: string;
  iconName?: string;
  color?: string;
  size?: number;
  className?: string;
  showBackground?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  ShoppingBag,
  Bus,
  Fuel,
  ShoppingCart,
  Zap,
  Home,
  GraduationCap,
  HeartPulse,
  Film,
  Plane,
  Wifi,
  Tv,
  User,
  Landmark,
  TrendingUp,
  Gift,
  Briefcase,
  Laptop,
  Coffee,
  Car,
  Smartphone,
  Tag,
  CreditCard,
  MoreHorizontal,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryName,
  iconName,
  color,
  size = 20,
  className = '',
  showBackground = true,
}) => {
  const { categories } = useTransactions();

  const cat = categoryName
    ? categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())
    : null;

  const resolvedIconName = iconName || cat?.icon || 'MoreHorizontal';
  const resolvedColor = color || cat?.color || '#64748b';

  const IconComponent = ICON_MAP[resolvedIconName] || CircleDollarSign;

  if (!showBackground) {
    return (
      <IconComponent 
        size={size} 
        style={{ color: resolvedColor }} 
        className={className} 
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${className}`}
      style={{
        backgroundColor: `${resolvedColor}18`,
        color: resolvedColor,
        width: size * 1.8,
        height: size * 1.8,
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
