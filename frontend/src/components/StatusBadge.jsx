import React from 'react';
import { 
  Clock, CheckCircle, ChefHat, Bell, CheckCircle2, XCircle, DollarSign, AlertCircle
} from 'lucide-react';

const StatusBadge = ({ status, type = 'order' }) => {
  if (type === 'payment') {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PAID
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <DollarSign className="w-3.5 h-3.5" />
            REFUNDED
          </span>
        );
      case 'PAYMENT_PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            CASH PENDING
          </span>
        );
    }
  }

  // Order status
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          PENDING APPROVAL
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <CheckCircle className="w-3.5 h-3.5" />
          APPROVED
        </span>
      );
    case 'PREPARING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
          <ChefHat className="w-3.5 h-3.5" />
          PREPARING IN KITCHEN
        </span>
      );
    case 'READY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
          <Bell className="w-3.5 h-3.5" />
          READY TO SERVE
        </span>
      );
    case 'SERVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300">
          <CheckCircle className="w-3.5 h-3.5" />
          SERVED AT TABLE
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          COMPLETED
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5" />
          REJECTED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-stone-100 text-stone-700">
          {status}
        </span>
      );
  }
};

export default StatusBadge;

