// Simple input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and encode special characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&"']/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[match] || match;
    })
    .trim();
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '');
};

export const sanitizeMobile = (mobile: string): string => {
  if (!mobile) return '';
  return mobile.replace(/[^0-9]/g, '');
};

export const sanitizeName = (name: string): string => {
  if (!name) return '';
  return name.replace(/[^a-zA-Z\s]/g, '').trim();
};

