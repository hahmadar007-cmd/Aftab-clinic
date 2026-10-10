import React, { createContext, useContext, useState } from 'react';
import type { LabTest, HealthPackage } from '../data/labData';

export interface BookingCartItem {
  id: string;
  code: string;
  name: string;
  price: number;
  sample: string;
  type: 'test' | 'package';
}

export interface PatientInfo {
  patientName: string;
  phoneNumber: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  collectionType: 'Home Collection' | 'Clinic Visit';
  address: string;
  preferredDate: string;
  preferredTimeSlot: string;
}

interface BookingContextType {
  cart: BookingCartItem[];
  addToCart: (item: LabTest | HealthPackage, type: 'test' | 'package') => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalPrice: number;
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  generateWhatsAppVoucher: (info: PatientInfo) => string;
}

const DEFAULT_PATIENT: PatientInfo = {
  patientName: '',
  phoneNumber: '',
  age: '',
  gender: 'Male',
  collectionType: 'Clinic Visit',
  address: '',
  preferredDate: '',
  preferredTimeSlot: 'Morning (08:00 AM - 12:00 PM)',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<BookingCartItem[]>(() => {
    const saved = localStorage.getItem('aftab_booking_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [patientInfo, setPatientInfo] = useState<PatientInfo>(DEFAULT_PATIENT);

  const addToCart = (item: LabTest | HealthPackage, type: 'test' | 'package') => {
    const price = 'rate' in item ? item.rate : item.price;
    const newItem: BookingCartItem = {
      id: item.id,
      code: item.code,
      name: item.name,
      price: price,
      sample: item.sample,
      type: type,
    };
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const updated = [...prev, newItem];
      localStorage.setItem('aftab_booking_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('aftab_booking_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('aftab_booking_cart');
  };

  const isInCart = (id: string) => cart.some((i) => i.id === id);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const generateWhatsAppVoucher = (info: PatientInfo) => {
    const bookingId = 'AC-BK-' + Math.floor(100000 + Math.random() * 900000);
    const itemList = cart
      .map((item, index) => `${index + 1}. [${item.code}] ${item.name} - Rs. ${item.price.toLocaleString()}`)
      .join('\n');

    const message = `🧪 *AFTAB CLINIC DIAGNOSTIC BOOKING VOUCHER*
----------------------------------------
📋 *Booking Reference*: ${bookingId}
👤 *Patient Name*: ${info.patientName}
📱 *Phone Number*: ${info.phoneNumber}
🎂 *Age / Gender*: ${info.age} Yrs / ${info.gender}
🏥 *Collection Method*: ${info.collectionType}
📅 *Preferred Date*: ${info.preferredDate || 'Earliest Available'}
⏰ *Time Slot*: ${info.preferredTimeSlot}
${info.collectionType === 'Home Collection' ? `📍 *Home Address*: ${info.address}\n` : ''}
----------------------------------------
📝 *TESTS & PACKAGES SELECTED*:
${itemList}

💵 *TOTAL AMOUNT*: *Rs. ${totalPrice.toLocaleString()} PKR*
----------------------------------------
Please confirm my appointment and diagnostic sample collection.`;

    return message;
  };

  return (
    <BookingContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalPrice,
        patientInfo,
        setPatientInfo,
        generateWhatsAppVoucher,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
