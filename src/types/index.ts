export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface WhatsAppConfig {
  phoneNumber: string;
  displayPhone: string;
  defaultMessage: string;
}
