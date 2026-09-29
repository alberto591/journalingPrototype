import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Referral } from '../types';

const REFERRAL_CLICK_KEY = 'travesia_active_referral_code';
const REFERRALS_LOCAL_KEY = 'travesia_referrals_v3';

export const referralService = {
  // Generate a clean slug-based referral code for a member
  generateReferralCode(name: string, userId: string): string {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const shortId = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toLowerCase();
    return `${slug || 'travesia'}-${shortId || '2026'}`;
  },

  // Record when someone visits /r/:code
  recordReferralClick(code: string): void {
    if (!code) return;
    try {
      localStorage.setItem(REFERRAL_CLICK_KEY, code.trim().toLowerCase());
    } catch {}
  },

  // Retrieve stored referral code during trial signup or checkout
  getStoredReferralCode(): string | null {
    try {
      return localStorage.getItem(REFERRAL_CLICK_KEY);
    } catch {
      return null;
    }
  },

  // Clear stored referral code after attribution
  clearStoredReferralCode(): void {
    try {
      localStorage.removeItem(REFERRAL_CLICK_KEY);
    } catch {}
  },

  // Link referred user with referrer in database
  async recordReferralConversion(referralCode: string, newUserId: string): Promise<void> {
    if (!referralCode || !newUserId) return;

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(REFERRALS_LOCAL_KEY);
        const list: Referral[] = stored ? JSON.parse(stored) : [];
        list.push({
          id: `ref-${Date.now()}`,
          referrer_user_id: 'unknown-referrer',
          referred_user_id: newUserId,
          referral_code: referralCode,
          status: 'converted',
          created_at: new Date().toISOString(),
        });
        localStorage.setItem(REFERRALS_LOCAL_KEY, JSON.stringify(list));
      } catch {}
      return;
    }

    try {
      // Find the profile holding this referral code
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (referrerProfile) {
        await supabase.from('referrals').insert({
          referrer_user_id: referrerProfile.id,
          referred_user_id: newUserId,
          referral_code: referralCode,
          status: 'converted',
        });
      }
    } catch {}
  },

  // Fetch referrals for a specific referrer
  async fetchUserReferrals(userId: string): Promise<Referral[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(REFERRALS_LOCAL_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', userId);

      if (error) return [];
      return data as Referral[];
    } catch {
      return [];
    }
  },
};
