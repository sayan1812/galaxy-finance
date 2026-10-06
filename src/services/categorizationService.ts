import type { MerchantCategoryMapping } from '../types';

const MERCHANT_MEMORY_STORAGE_KEY = 'rupeewise_merchant_rules';

// Built-in keyword-to-category dictionary
const BUILT_IN_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  {
    category: 'Food & Restaurant',
    keywords: [
      'swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald',
      'kfc', 'burger king', 'domino', 'pizza', 'diner', 'chai', 'tea', 'samosa',
      'dhaba', 'eats', 'biryani', 'bakery', 'subway', 'barbeque nation', 'haldiram'
    ],
  },
  {
    category: 'Grocery',
    keywords: [
      'blinkit', 'zepto', 'bigbasket', 'instamart', 'fresh', 'supermarket', 'mart',
      'reliance retail', 'reliance fresh', 'dmart', 'd-mart', 'nature basket',
      'grocer', 'spencer', 'vegetable', 'dairy', 'milk', 'amul'
    ],
  },
  {
    category: 'Transportation',
    keywords: [
      'uber', 'ola', 'rapido', 'metro', 'auto', 'cab', 'taxi', 'irctc', 'railway',
      'bus', 'chalo', 'toll', 'fastag', 'parking', 'redbus', 'yulu'
    ],
  },
  {
    category: 'Fuel',
    keywords: [
      'petrol', 'fuel', 'hpcl', 'iocl', 'bpcl', 'shell', 'cng', 'indian oil',
      'bharat petroleum', 'hindustan petroleum', 'gas station'
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'zara', 'h&m',
      'clothing', 'store', 'mall', 'retail', 'croma', 'reliance digital', 'lifestyle',
      'shoppers stop', 'uniqlo', 'decathlon'
    ],
  },
  {
    category: 'Bills & Utilities',
    keywords: [
      'bescom', 'tata power', 'adani electricity', 'cesc', 'water board', 'electricity',
      'piped gas', 'utility', 'mahavitaran', 'electricity bill', 'water bill', 'municipal'
    ],
  },
  {
    category: 'Medical/Healthcare',
    keywords: [
      'apollo', 'pharmacy', 'chemist', '1mg', 'pharmeasy', 'medplus', 'hospital',
      'clinic', 'doctor', 'dr.', 'diagnostics', 'pathology', 'lab', 'dental',
      'lenskart', 'eye care'
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      'bookmyshow', 'pvr', 'inox', 'cinepolis', 'cinema', 'movie', 'spotify',
      'apple music', 'gaana', 'wynk', 'steam', 'playstation', 'gaming', 'amusement'
    ],
  },
  {
    category: 'Subscription',
    keywords: [
      'netflix', 'prime video', 'disney+', 'hotstar', 'youtube premium', 'chatgpt',
      'openai', 'icloud', 'google one', 'linkedin', 'github', 'subscription',
      'prime membership', 'medium', 'canva'
    ],
  },
  {
    category: 'Mobile/Internet',
    keywords: [
      'airtel', 'jio', 'vi', 'vodafone', 'act corp', 'act fibernet', 'bsnl',
      'broadband', 'recharge', 'wifi', 'tata play', 'dth'
    ],
  },
  {
    category: 'Rent',
    keywords: [
      'house rent', 'flat rent', 'landlord', 'nobroker rent', 'nestaway', 'rent payment'
    ],
  },
  {
    category: 'Education',
    keywords: [
      'coursera', 'udemy', 'edx', 'school', 'college', 'tuition', 'fee', 'books',
      'university', 'byju', 'unacademy', 'exam fee'
    ],
  },
  {
    category: 'Salary',
    keywords: [
      'salary', 'payroll', 'wages', 'employer', 'ctc credit', 'salary credit',
      'monthly salary', 'stipend'
    ],
  },
  {
    category: 'Freelance/Business',
    keywords: [
      'upwork', 'fiverr', 'client payment', 'consulting', 'invoice settlement',
      'razorpay payout', 'stripe payout', 'freelance', 'contract payment'
    ],
  },
  {
    category: 'Loan/EMI',
    keywords: [
      'emi', 'loan', 'bajaj finance', 'hdfc emi', 'home loan', 'car loan',
      'personal loan', 'credit card emi', 'slice'
    ],
  },
  {
    category: 'Investment',
    keywords: [
      'zerodha', 'groww', 'kuvera', 'mutual fund', 'sip', 'etmoney', 'upstox',
      'angel one', 'fixed deposit', 'nps', 'ppf', 'stock broker', 'coin'
    ],
  },
];

class CategorizationService {
  private learnedRules: Map<string, MerchantCategoryMapping> = new Map();

  constructor() {
    this.loadLearnedRules();
  }

  private normalizeKey(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private loadLearnedRules(): void {
    try {
      const stored = localStorage.getItem(MERCHANT_MEMORY_STORAGE_KEY);
      if (stored) {
        const parsed: MerchantCategoryMapping[] = JSON.parse(stored);
        this.learnedRules.clear();
        parsed.forEach((m) => {
          this.learnedRules.set(m.merchantKey, m);
        });
      }
    } catch (e) {
      console.warn('Failed to load merchant memory rules:', e);
    }
  }

  private persistLearnedRules(): void {
    try {
      const array = Array.from(this.learnedRules.values());
      localStorage.setItem(MERCHANT_MEMORY_STORAGE_KEY, JSON.stringify(array));
    } catch (e) {
      console.error('Failed to save merchant memory rules:', e);
    }
  }

  /**
   * Categorize a transaction based on merchant name and description.
   * Priority:
   * 1. User-overridden learned merchant memory
   * 2. Built-in merchant / keyword matching
   * 3. Fallback default category ('Other')
   */
  public categorize(merchantName?: string, description?: string, fallbackType: 'INCOME' | 'EXPENSE' = 'EXPENSE'): string {
    const textToMatch = `${merchantName || ''} ${description || ''}`.trim().toLowerCase();
    if (!textToMatch) {
      return fallbackType === 'INCOME' ? 'Other' : 'Other';
    }

    // 1. Check learned merchant rules
    if (merchantName) {
      const normalizedMerchant = this.normalizeKey(merchantName);
      if (this.learnedRules.has(normalizedMerchant)) {
        return this.learnedRules.get(normalizedMerchant)!.category;
      }

      // Also check partial word matches against learned keys
      for (const [key, mapping] of this.learnedRules.entries()) {
        if (normalizedMerchant.includes(key) || key.includes(normalizedMerchant)) {
          return mapping.category;
        }
      }
    }

    // 2. Check built-in keywords
    for (const rule of BUILT_IN_KEYWORDS) {
      for (const kw of rule.keywords) {
        if (textToMatch.includes(kw)) {
          return rule.category;
        }
      }
    }

    // 3. Fallback
    return fallbackType === 'INCOME' ? 'Salary' : 'Other';
  }

  /**
   * Remember user-corrected merchant category so future transactions
   * with this merchant are automatically categorized.
   */
  public learnMerchantCategory(merchantName: string, category: string): void {
    if (!merchantName || !category) return;
    const key = this.normalizeKey(merchantName);
    if (!key) return;

    const mapping: MerchantCategoryMapping = {
      merchantKey: key,
      category,
      learnedAt: new Date().toISOString(),
      userOverridden: true,
    };

    this.learnedRules.set(key, mapping);
    this.persistLearnedRules();
  }

  /**
   * Retrieve all saved custom merchant mappings
   */
  public getLearnedRules(): MerchantCategoryMapping[] {
    return Array.from(this.learnedRules.values());
  }

  /**
   * Remove a learned rule
   */
  public removeLearnedRule(merchantKey: string): void {
    this.learnedRules.delete(merchantKey);
    this.persistLearnedRules();
  }

  /**
   * Clear all learned rules
   */
  public clearAllLearnedRules(): void {
    this.learnedRules.clear();
    this.persistLearnedRules();
  }
}

export const categorizationService = new CategorizationService();
