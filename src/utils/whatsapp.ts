/**
 * Clean and format any Pakistani or international phone number into standard WhatsApp format (e.g. 923103019902)
 */
export const cleanWhatsAppNumber = (phone: string): string => {
  if (!phone) return '923001234567';
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // Handle Pakistani 03xxxxxxxxx format (11 digits starting with 03 -> 923xxxxxxxxx)
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    cleaned = '92' + cleaned.substring(1);
  } 
  // Handle 3xxxxxxxxx format (10 digits starting with 3 -> 923xxxxxxxxx)
  else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
};

/**
 * Universal WhatsApp Deep-Link compatible with WhatsApp Messenger, WhatsApp Business, Desktop & Mobile
 */
export const getWhatsAppUrl = (phone: string, text: string): string => {
  const cleanNum = cleanWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text);
  // api.whatsapp.com/send triggers the native OS app selector (WhatsApp Business or Regular WhatsApp) on iOS, Android, and Desktop
  return `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodedText}`;
};
