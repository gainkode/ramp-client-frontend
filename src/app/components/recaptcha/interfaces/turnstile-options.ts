export interface TurnstileOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  appearance?: 'execute' | 'interaction-only' | 'always'; 
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  tabindex?: number;
}