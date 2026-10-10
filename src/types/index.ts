export interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface WhatsAppConfig {
  phoneNumber: string;
  displayPhone: string;
  defaultMessage: string;
}
