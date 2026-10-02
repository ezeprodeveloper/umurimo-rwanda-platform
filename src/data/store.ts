import {
  User,
  InvestmentTier,
  ProductPurchase,
  Task,
  TaskSubmission,
  WithdrawalRequest,
  Transaction,
  BroadcastNotification,
  ChatMessage,
  ReferralRecord
} from '../types';
import {
  INITIAL_TIERS,
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_BROADCASTS,
  INITIAL_CHATS,
  INITIAL_REFERRALS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'umurimo_users_v3',
  CURRENT_USER: 'umurimo_current_user_v3',
  TIERS: 'umurimo_tiers_v3',
  PURCHASES: 'umurimo_purchases_v3',
  TASKS: 'umurimo_tasks_v3',
  SUBMISSIONS: 'umurimo_submissions_v3',
  WITHDRAWALS: 'umurimo_withdrawals_v3',
  TRANSACTIONS: 'umurimo_transactions_v3',
  BROADCASTS: 'umurimo_broadcasts_v3',
  CHATS: 'umurimo_chats_v3',
  REFERRALS: 'umurimo_referrals_v3'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

class AppStore {
  private users: User[] = [];
  private currentUser: User | null = null;
  private tiers: InvestmentTier[] = [];
  private purchases: ProductPurchase[] = [];
  private tasks: Task[] = [];
  private submissions: TaskSubmission[] = [];
  private withdrawals: WithdrawalRequest[] = [];
  private transactions: Transaction[] = [];
  private broadcasts: BroadcastNotification[] = [];
  private chats: ChatMessage[] = [];
  private referrals: ReferralRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    this.users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS).map((u) => {
      if (!u.referralCode) {
        const codePart = (u.name.split(' ')[0] || 'RW').replace(/[^a-zA-Z]/g, '').toUpperCase();
        u.referralCode = `${codePart}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      if (u.referralCount === undefined) u.referralCount = 0;
      if (u.referralEarnings === undefined) u.referralEarnings = 0;
      if (u.dailyCheckInStreak === undefined) u.dailyCheckInStreak = 1;
      if (u.totalDailyCheckInEarned === undefined) u.totalDailyCheckInEarned = 0;
      return u;
    });
    this.currentUser = loadStorage(STORAGE_KEYS.CURRENT_USER, this.users[1]); // Default to Mugisha demo user
    this.tiers = loadStorage(STORAGE_KEYS.TIERS, INITIAL_TIERS);
    this.referrals = loadStorage(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
    this.purchases = loadStorage(STORAGE_KEYS.PURCHASES, [
      {
        id: 'pur-1',
        userId: 'user-demo-1',
        userName: 'Mugisha Patrick',
        userPhone: '0789456123',
        tierAmount: 10000,
        paymentMethod: 'MTN',
        ussdCode: '*182*1*2*0738514596*10000#',
        senderPhone: '0789456123',
        transactionId: 'MP260216091512',
        screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        status: 'approved',
        dailyProfitAmount: 750,
        createdAt: '2026-02-16T09:15:00.000Z',
        approvedAt: '2026-02-16T09:30:00.000Z',
        lastProfitClaimedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        totalProfitEarned: 3750
      }
    ]);
    this.tasks = loadStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    this.submissions = loadStorage(STORAGE_KEYS.SUBMISSIONS, [
      {
        id: 'sub-sample-1',
        taskId: 'task-yt-1',
        taskTitle: 'Subscribe to Ishema News YouTube Channel',
        taskType: 'youtube_subscribe',
        userId: 'user-demo-1',
        userName: 'Mugisha Patrick',
        userPhone: '0789456123',
        reward: 250,
        proofPhotoUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
        notes: 'Subscribed to channel and tapped bell icon!',
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ]);
    this.withdrawals = loadStorage(STORAGE_KEYS.WITHDRAWALS, [
      {
        id: 'wd-sample-1',
        userId: 'user-demo-1',
        userName: 'Mugisha Patrick',
        userPhone: '0789456123',
        amount: 5000,
        fee: 1500, // 30% fee
        netAmount: 3500,
        method: 'MTN',
        recipientPhone: '0789456123',
        recipientName: 'Mugisha Patrick',
        status: 'pending',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ]);
    this.transactions = loadStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    this.broadcasts = loadStorage(STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS);
    this.chats = loadStorage(STORAGE_KEYS.CHATS, INITIAL_CHATS);

    this.checkAutoDailyProfits();
  }

  public checkAutoDailyProfits(): void {
    const now = Date.now();
    let updated = false;
    const DAY_MS = 24 * 3600 * 1000;

    this.purchases.forEach((p) => {
      if (p.status !== 'approved') return;
      const lastClaim = new Date(p.lastProfitClaimedAt || p.approvedAt || p.createdAt).getTime();
      const elapsed = now - lastClaim;

      if (elapsed >= DAY_MS) {
        const daysToCredit = Math.floor(elapsed / DAY_MS);
        if (daysToCredit > 0) {
          const currentTier = this.tiers.find((t) => t.tierAmount === p.tierAmount);
          const dailyRate = currentTier ? currentTier.dailyProfit : p.dailyProfitAmount;
          const totalCredited = dailyRate * daysToCredit;

          const user = this.users.find((u) => u.id === p.userId);
          if (user) {
            user.balance += totalCredited;
            user.totalEarned += totalCredited;

            p.totalProfitEarned += totalCredited;
            p.lastProfitClaimedAt = new Date(lastClaim + daysToCredit * DAY_MS).toISOString();

            const tx: Transaction = {
              id: 'tx-auto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              userId: user.id,
              userName: user.name,
              type: 'daily_profit',
              amount: totalCredited,
              direction: 'in',
              description: `Automatic 24h Daily Profit Credit: +${totalCredited.toLocaleString()} RWF (${daysToCredit} day(s))`,
              status: 'completed',
              date: new Date().toISOString()
            };
            this.transactions.unshift(tx);

            this.broadcasts.unshift({
              id: 'notif-auto-' + Date.now(),
              senderName: 'Umurimo System',
              title: 'Daily Profit Automatically Credited!',
              message: `Your active product (${p.tierAmount.toLocaleString()} RWF) generated +${totalCredited.toLocaleString()} RWF profit automatically after 24 hours. Added to your balance!`,
              type: 'success',
              targetUserId: user.id,
              createdAt: new Date().toISOString()
            });

            updated = true;
          }
        }
      }
    });

    if (updated) {
      saveStorage(STORAGE_KEYS.USERS, this.users);
      saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);
      saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
      saveStorage(STORAGE_KEYS.BROADCASTS, this.broadcasts);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- GETTERS ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getTiers(): InvestmentTier[] {
    return [...this.tiers];
  }

  public getPurchases(): ProductPurchase[] {
    return [...this.purchases];
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public getSubmissions(): TaskSubmission[] {
    return [...this.submissions];
  }

  public getWithdrawals(): WithdrawalRequest[] {
    return [...this.withdrawals];
  }

  public getTransactions(userId?: string): Transaction[] {
    if (!userId) return [...this.transactions];
    return this.transactions.filter((tx) => tx.userId === userId);
  }

  public getBroadcasts(): BroadcastNotification[] {
    return [...this.broadcasts];
  }

  public getChats(userId: string): ChatMessage[] {
    return this.chats.filter(
      (c) => c.senderId === userId || c.receiverId === userId || c.receiverId === 'ALL'
    );
  }

  public getReferrals(userId?: string): ReferralRecord[] {
    if (!userId) return [...this.referrals];
    return this.referrals.filter((r) => r.referrerId === userId);
  }

  public getAllReferrals(): ReferralRecord[] {
    return [...this.referrals];
  }

  // --- AUTHENTICATION & SESSIONS ---
  public login(identifier: string, role: 'user' | 'admin' = 'user'): { success: boolean; message: string; user?: User } {
    const clean = identifier.trim().toLowerCase();
    const found = this.users.find(
      (u) =>
        (u.email.toLowerCase() === clean || u.phone === clean) &&
        (role === 'admin' ? u.role === 'admin' : true)
    );

    if (!found) {
      return {
        success: false,
        message: role === 'admin' ? 'Invalid administrator credentials.' : 'User account not found with this email or phone.'
      };
    }

    if (found.isBlocked) {
      return {
        success: false,
        message: 'Your account has been suspended by the administrator. Please contact support.'
      };
    }

    this.currentUser = found;
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
    return { success: true, message: 'Logged in successfully!', user: found };
  }

  public register(data: {
    name: string;
    email: string;
    phone: string;
    district: string;
    birthDate: string;
    avatar?: string;
    referralCode?: string;
  }): { success: boolean; message: string; user?: User } {
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase().trim() || u.phone === data.phone.trim()
    );

    if (existing) {
      return {
        success: false,
        message: 'This email address or phone number is already registered.'
      };
    }

    const nameParts = data.name.trim().split(' ');
    const codePrefix = (nameParts[0] || 'RW').replace(/[^a-zA-Z]/g, '').toUpperCase();
    const myReferralCode = `${codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isMtn = data.phone.trim().startsWith('078') || data.phone.trim().startsWith('079');

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      district: data.district || 'Gasabo (Kigali)',
      birthDate: data.birthDate || '2000-01-01',
      avatar: data.avatar || '/src/assets/images/avatar_user_rw_1790691607872.jpg',
      role: 'user',
      isBlocked: false,
      balance: 2500, // Immediate 2,500 RWF Registration Bonus!
      registrationBonus: 2500,
      hasBoughtProduct: false, // Must buy a product to withdraw this bonus!
      totalEarned: 2500,
      totalWithdrawn: 0,
      referralCode: myReferralCode,
      referralCount: 0,
      referralEarnings: 0,
      dailyCheckInStreak: 0,
      totalDailyCheckInEarned: 0,
      momoProvider: isMtn ? 'MTN' : 'AIRTEL_TIGO',
      momoPhone: data.phone.trim(),
      momoName: data.name.trim(),
      bio: 'Member at Umurimo Rwanda',
      createdAt: new Date().toISOString()
    };

    // If registered via a friend's referral code:
    let referrerBonusMsg = '';
    if (data.referralCode && data.referralCode.trim()) {
      const cleanRef = data.referralCode.trim().toUpperCase();
      const referrer = this.users.find(
        (u) => u.referralCode && u.referralCode.toUpperCase() === cleanRef
      );

      if (referrer) {
        newUser.referredBy = referrer.referralCode;
        referrer.balance += 500;
        referrer.totalEarned += 500;
        referrer.referralEarnings = (referrer.referralEarnings || 0) + 500;
        referrer.referralCount = (referrer.referralCount || 0) + 1;

        const refRecord: ReferralRecord = {
          id: 'ref-' + Date.now(),
          referrerId: referrer.id,
          referrerCode: referrer.referralCode,
          referredUserId: newUser.id,
          referredUserName: newUser.name,
          referredUserPhone: newUser.phone,
          bonusEarned: 500,
          status: 'registered',
          createdAt: new Date().toISOString()
        };
        this.referrals.unshift(refRecord);
        saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);

        const refTx: Transaction = {
          id: 'tx-ref-' + Date.now(),
          userId: referrer.id,
          userName: referrer.name,
          type: 'referral_bonus',
          amount: 500,
          direction: 'in',
          description: `Referral Registration Bonus: +500 RWF for inviting ${newUser.name}`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(refTx);

        this.addNotification({
          title: 'New Friend Registered with your Link! (+500 RWF)',
          message: `${newUser.name} just signed up using your referral code (${referrer.referralCode}). We credited +500 RWF instant bonus to your wallet!`,
          type: 'success',
          targetUserId: referrer.id
        });

        referrerBonusMsg = ` (Invited by ${referrer.name} - Referral bonus credited!)`;
      }
    }

    this.users.push(newUser);
    this.currentUser = newUser;
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);

    // Record Bonus Transaction
    const bonusTx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: newUser.id,
      userName: newUser.name,
      type: 'bonus',
      amount: 2500,
      direction: 'in',
      description: 'Welcome Registration Bonus: 2,500 RWF (Policy: Buy at least 1 product to unlock withdrawals)',
      status: 'completed',
      date: new Date().toISOString()
    };
    this.transactions.unshift(bonusTx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Welcome Notification
    this.addNotification({
      title: 'Welcome to Umurimo Rwanda! You received 2,500 RWF Bonus',
      message: `We are excited to welcome you. Your account received 2,500 RWF immediately!${referrerBonusMsg} Purchase at least one daily profit product starting from 5,000 RWF to unlock your bonus and profits for withdrawal.`,
      type: 'system',
      targetUserId: newUser.id
    });

    this.notify();
    return {
      success: true,
      message: `Account registered successfully! 2,500 RWF bonus added to your wallet.${referrerBonusMsg}`,
      user: newUser
    };
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  public switchUser(user: User): void {
    this.currentUser = user;
    saveStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  // --- USER PROFILE & PASSWORD ---
  public updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'phone' | 'district' | 'birthDate' | 'avatar' | 'email' | 'momoProvider' | 'momoPhone' | 'momoName' | 'bio'>>
  ): { success: boolean; message: string } {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updates
    };

    this.users[userIndex] = updatedUser;
    if (this.currentUser?.id === userId) {
      this.currentUser = updatedUser;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }
    saveStorage(STORAGE_KEYS.USERS, this.users);

    this.notify();
    return { success: true, message: 'Profile details saved and updated live across the platform!' };
  }

  public changePassword(userId: string, _oldPass: string, _newPass: string): { success: boolean; message: string } {
    return { success: true, message: 'Password changed successfully!' };
  }

  // --- ADMIN USER MANAGEMENT ---
  public toggleBlockUser(userId: string): { success: boolean; isBlocked: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, isBlocked: false, message: 'User not found' };

    user.isBlocked = !user.isBlocked;
    saveStorage(STORAGE_KEYS.USERS, this.users);

    if (this.currentUser?.id === userId && user.isBlocked) {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    this.notify();
    return {
      success: true,
      isBlocked: user.isBlocked,
      message: user.isBlocked ? 'User has been blocked!' : 'User has been unblocked!'
    };
  }

  public deleteUser(userId: string): { success: boolean; message: string } {
    this.users = this.users.filter((u) => u.id !== userId);
    this.transactions = this.transactions.filter((tx) => tx.userId !== userId);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    if (this.currentUser?.id === userId) {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    this.notify();
    return { success: true, message: 'User account deleted permanently from system.' };
  }

  // --- INVESTMENT PRODUCTS & DEPOSITS ---
  public buyProduct(data: {
    userId: string;
    tierAmount: number;
    paymentMethod: 'MTN' | 'AIRTEL_TIGO';
    senderPhone: string;
    transactionId: string;
    screenshotUrl: string;
  }): { success: boolean; message: string; purchase?: ProductPurchase } {
    const user = this.users.find((u) => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found.' };

    const tier = this.tiers.find((t) => t.tierAmount === data.tierAmount);
    if (!tier) return { success: false, message: 'Selected product package does not exist.' };

    const ussdCode =
      data.paymentMethod === 'MTN'
        ? `*182*1*2*0738514596*${data.tierAmount}#`
        : `*182*1*1*0738514596*${data.tierAmount}#`;

    const newPurchase: ProductPurchase = {
      id: 'pur-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: data.senderPhone || user.phone,
      tierAmount: data.tierAmount,
      paymentMethod: data.paymentMethod,
      ussdCode,
      senderPhone: data.senderPhone || user.phone,
      transactionId: data.transactionId || 'MOMO-' + Math.floor(100000 + Math.random() * 900000),
      screenshotUrl: data.screenshotUrl,
      status: 'pending',
      dailyProfitAmount: tier.dailyProfit,
      createdAt: new Date().toISOString(),
      totalProfitEarned: 0
    };

    this.purchases.unshift(newPurchase);
    saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);

    // Notify Admin
    this.addNotification({
      title: 'New Product Purchase Request!',
      message: `${user.name} submitted payment of ${data.tierAmount.toLocaleString()} RWF on ${data.paymentMethod}. Please inspect the screenshot and Approve.`,
      type: 'system',
      targetUserId: 'user-admin-1'
    });

    this.notify();
    return {
      success: true,
      message: 'Product purchase request submitted! The administrator will review and approve shortly.',
      purchase: newPurchase
    };
  }

  public reviewProductPurchase(
    purchaseId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const purchase = this.purchases.find((p) => p.id === purchaseId);
    if (!purchase) return { success: false, message: 'Purchase request not found.' };

    const user = this.users.find((u) => u.id === purchase.userId);

    if (action === 'approve') {
      purchase.status = 'approved';
      purchase.approvedAt = new Date().toISOString();
      purchase.lastProfitClaimedAt = new Date().toISOString();

      if (user) {
        user.hasBoughtProduct = true; // User can now withdraw bonus!
        saveStorage(STORAGE_KEYS.USERS, this.users);

        // Record Deposit Transaction
        const tx: Transaction = {
          id: 'tx-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'deposit_product',
          amount: purchase.tierAmount,
          direction: 'in',
          description: `Product Purchase: ${purchase.tierAmount.toLocaleString()} RWF via ${purchase.paymentMethod} (Approved)`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(tx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

        // Check if user was referred by someone and credit 10% referral commission!
        if (user.referredBy) {
          const referrer = this.users.find(
            (u) => u.referralCode && u.referralCode.toUpperCase() === user.referredBy?.toUpperCase()
          );
          if (referrer) {
            const commission = Math.round(purchase.tierAmount * 0.1);
            referrer.balance += commission;
            referrer.totalEarned += commission;
            referrer.referralEarnings = (referrer.referralEarnings || 0) + commission;

            // Update or add referral record
            const refRec = this.referrals.find(
              (r) => r.referrerId === referrer.id && r.referredUserId === user.id
            );
            if (refRec) {
              refRec.status = 'product_bought';
              refRec.bonusEarned = (refRec.bonusEarned || 0) + commission;
            } else {
              this.referrals.unshift({
                id: 'ref-' + Date.now(),
                referrerId: referrer.id,
                referrerCode: referrer.referralCode,
                referredUserId: user.id,
                referredUserName: user.name,
                referredUserPhone: user.phone,
                bonusEarned: commission,
                status: 'product_bought',
                createdAt: new Date().toISOString()
              });
            }
            saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);

            const commTx: Transaction = {
              id: 'tx-comm-' + Date.now(),
              userId: referrer.id,
              userName: referrer.name,
              type: 'referral_bonus',
              amount: commission,
              direction: 'in',
              description: `10% Referral Commission: +${commission.toLocaleString()} RWF (${purchase.tierAmount.toLocaleString()} RWF product by ${user.name})`,
              status: 'completed',
              date: new Date().toISOString()
            };
            this.transactions.unshift(commTx);

            this.addNotification({
              title: `10% Referral Commission Received! (+${commission.toLocaleString()} RWF)`,
              message: `Your invited friend ${user.name} had their ${purchase.tierAmount.toLocaleString()} RWF product approved! You received 10% cash bonus (+${commission.toLocaleString()} RWF) credited directly to your balance!`,
              type: 'success',
              targetUserId: referrer.id
            });
          }
        }

        // Notify User
        this.addNotification({
          title: 'Your Product Purchase was Approved!',
          message: `Your ${purchase.tierAmount.toLocaleString()} RWF product was approved. You will earn +${purchase.dailyProfitAmount.toLocaleString()} RWF daily profit every 24h! Your 2,500 RWF registration bonus is now unlocked for withdrawal.`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      purchase.status = 'rejected';
      purchase.rejectionReason = rejectionReason || 'Screenshot does not match payment record.';

      if (user) {
        this.addNotification({
          title: 'Product Purchase Request Rejected',
          message: `Your request for ${purchase.tierAmount.toLocaleString()} RWF was rejected. Reason: ${purchase.rejectionReason}`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);
    this.notify();
    return {
      success: true,
      message: action === 'approve' ? 'Product purchase Approved!' : 'Product purchase Rejected!'
    };
  }

  // Claim Daily Profit for approved products
  public claimDailyProfit(userId: string): { success: boolean; amount: number; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, amount: 0, message: 'User not found.' };

    const approvedPurchases = this.purchases.filter((p) => p.userId === userId && p.status === 'approved');
    if (approvedPurchases.length === 0) {
      return { success: false, amount: 0, message: 'You have no active approved products yet.' };
    }

    let totalClaimable = 0;
    const now = Date.now();

    approvedPurchases.forEach((p) => {
      const currentTier = this.tiers.find((t) => t.tierAmount === p.tierAmount);
      const profitRate = currentTier ? currentTier.dailyProfit : p.dailyProfitAmount;

      totalClaimable += profitRate;
      p.totalProfitEarned += profitRate;
      p.lastProfitClaimedAt = new Date(now).toISOString();
    });

    user.balance += totalClaimable;
    user.totalEarned += totalClaimable;

    // Record Transaction
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'daily_profit',
      amount: totalClaimable,
      direction: 'in',
      description: `Daily profit from ${approvedPurchases.length} product(s) (+${totalClaimable.toLocaleString()} RWF)`,
      status: 'completed',
      date: new Date().toISOString()
    };

    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.notify();
    return {
      success: true,
      amount: totalClaimable,
      message: `You claimed +${totalClaimable.toLocaleString()} RWF daily profit!`
    };
  }

  // --- ADMIN PROFIT SETTINGS PANEL ---
  public updateTierDailyProfit(tierId: string, newDailyProfit: number): { success: boolean; message: string } {
    const tier = this.tiers.find((t) => t.id === tierId);
    if (!tier) return { success: false, message: 'Product tier not found.' };

    tier.dailyProfit = newDailyProfit;
    tier.totalReturnPercent = Math.round(((newDailyProfit * tier.durationDays) / tier.tierAmount) * 100);
    tier.description = `Earn ${newDailyProfit.toLocaleString()} RWF daily for ${tier.durationDays} days. Price: ${tier.tierAmount.toLocaleString()} RWF.`;

    saveStorage(STORAGE_KEYS.TIERS, this.tiers);
    this.notify();
    return {
      success: true,
      message: `Daily profit for ${tier.tierAmount.toLocaleString()} RWF updated to ${newDailyProfit.toLocaleString()} RWF/day!`
    };
  }

  // --- TASKS SYSTEM & CREATION (ADVERTISER) ---
  public createTask(data: {
    creatorId: string;
    creatorName: string;
    title: string;
    type: Task['type'];
    description: string;
    instructions: string[];
    targetUrl: string;
    rewardPerTask: number;
    totalSlots: number;
    paymentProofUrl?: string;
    transactionId?: string;
  }): { success: boolean; message: string; task?: Task } {
    const totalBudget = data.rewardPerTask * data.totalSlots;
    const ussdCode = `*182*8*1*1880554*${totalBudget}#`;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      title: data.title,
      type: data.type,
      description: data.description,
      instructions: data.instructions,
      targetUrl: data.targetUrl,
      rewardPerTask: data.rewardPerTask,
      totalBudget,
      totalSlots: data.totalSlots,
      completedSlots: 0,
      requiresProof: data.type === 'youtube_subscribe' || data.type === 'youtube_watch',
      proofRequirementText:
        data.type === 'youtube_subscribe'
          ? 'Upload screenshot showing you subscribed to the channel'
          : data.type === 'youtube_watch'
          ? 'Upload screenshot showing you watched 2 minutes of the video'
          : undefined,
      paymentUssd: ussdCode,
      paymentProofUrl: data.paymentProofUrl,
      transactionId: data.transactionId || 'MOMO-' + Math.floor(100000 + Math.random() * 900000),
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask);
    saveStorage(STORAGE_KEYS.TASKS, this.tasks);

    // Notify Admin of task awaiting payment approval
    this.addNotification({
      title: 'New Task Campaign Pending Approval',
      message: `${data.creatorName} submitted task: "${data.title}" with total budget ${totalBudget.toLocaleString()} RWF via MoMo (${ussdCode}).`,
      type: 'task',
      targetUserId: 'user-admin-1'
    });

    this.notify();
    return {
      success: true,
      message: `Task campaign submitted! Once you dial ${ussdCode} and admin verifies payment, your task will be published to all users.`,
      task: newTask
    };
  }

  public adminManageTask(
    taskId: string,
    action: 'publish' | 'unpublish' | 'delete'
  ): { success: boolean; message: string } {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return { success: false, message: 'Task not found.' };

    if (action === 'delete') {
      this.tasks.splice(index, 1);
      saveStorage(STORAGE_KEYS.TASKS, this.tasks);
      this.notify();
      return { success: true, message: 'Task deleted successfully!' };
    }

    this.tasks[index].status = action === 'publish' ? 'published' : 'unpublished';
    saveStorage(STORAGE_KEYS.TASKS, this.tasks);
    this.notify();
    return {
      success: true,
      message: action === 'publish' ? 'Task campaign Approved & Published!' : 'Task campaign Unpublished!'
    };
  }

  // Submit task completion
  public submitTask(data: {
    taskId: string;
    userId: string;
    proofPhotoUrl?: string;
    notes?: string;
  }): { success: boolean; message: string; instantReward?: number } {
    const task = this.tasks.find((t) => t.id === data.taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    const user = this.users.find((u) => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found.' };

    const existing = this.submissions.find((s) => s.taskId === data.taskId && s.userId === data.userId);
    if (existing) {
      return { success: false, message: 'You have already completed this task!' };
    }

    if (task.requiresProof && !data.proofPhotoUrl) {
      return { success: false, message: 'Please upload a screenshot proving you subscribed or watched the video.' };
    }

    // If task requires proof (YouTube), it goes to Admin Review
    if (task.requiresProof) {
      const submission: TaskSubmission = {
        id: 'sub-' + Date.now(),
        taskId: task.id,
        taskTitle: task.title,
        taskType: task.type,
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        reward: task.rewardPerTask,
        proofPhotoUrl: data.proofPhotoUrl,
        notes: data.notes,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      this.submissions.unshift(submission);
      saveStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);

      // Notify Admin
      this.addNotification({
        title: 'New Task Proof Submission',
        message: `${user.name} submitted a screenshot proof for: "${task.title}". Please verify and approve.`,
        type: 'task',
        targetUserId: 'user-admin-1'
      });

      this.notify();
      return {
        success: true,
        message: 'Task proof submitted! The admin will review your screenshot and credit your wallet shortly.'
      };
    }

    // Instant approval for non-proof tasks (Survey, Short Video, General)
    task.completedSlots += 1;
    user.balance += task.rewardPerTask;
    user.totalEarned += task.rewardPerTask;

    const submission: TaskSubmission = {
      id: 'sub-' + Date.now(),
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.type,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      reward: task.rewardPerTask,
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString()
    };

    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'task_earning',
      amount: task.rewardPerTask,
      direction: 'in',
      description: `Task Reward: ${task.title}`,
      status: 'completed',
      date: new Date().toISOString()
    };

    this.submissions.unshift(submission);
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TASKS, this.tasks);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.notify();
    return {
      success: true,
      instantReward: task.rewardPerTask,
      message: `Great job! Task completed and +${task.rewardPerTask.toLocaleString()} RWF added to your wallet!`
    };
  }

  // Admin reviews task submission
  public reviewTaskSubmission(
    submissionId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, message: 'Submission not found.' };

    const user = this.users.find((u) => u.id === sub.userId);
    const task = this.tasks.find((t) => t.id === sub.taskId);

    if (action === 'approve') {
      sub.status = 'approved';
      sub.reviewedAt = new Date().toISOString();

      if (task) task.completedSlots += 1;

      if (user) {
        user.balance += sub.reward;
        user.totalEarned += sub.reward;

        const tx: Transaction = {
          id: 'tx-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'task_earning',
          amount: sub.reward,
          direction: 'in',
          description: `Task Proof Approved: ${sub.taskTitle}`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(tx);

        this.addNotification({
          title: 'Your Task Proof was Approved!',
          message: `Your screenshot for "${sub.taskTitle}" was approved by Admin. You received +${sub.reward.toLocaleString()} RWF!`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      sub.status = 'rejected';
      sub.reviewedAt = new Date().toISOString();
      sub.rejectionReason = rejectionReason || 'Screenshot does not show subscription or video playback.';

      if (user) {
        this.addNotification({
          title: 'Task Proof was Not Approved',
          message: `Your screenshot for "${sub.taskTitle}" was rejected. Reason: ${sub.rejectionReason}`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    saveStorage(STORAGE_KEYS.TASKS, this.tasks);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.notify();
    return {
      success: true,
      message: action === 'approve' ? 'Task proof approved and user credited!' : 'Task proof rejected!'
    };
  }

  // --- WITHDRAWALS ---
  public requestWithdrawal(data: {
    userId: string;
    amount: number;
    method: 'MTN' | 'AIRTEL_TIGO';
    recipientPhone: string;
    recipientName: string;
  }): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    const user = this.users.find((u) => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found.' };

    // Rule 1: Registration Bonus Lock - must buy a product first!
    if (!user.hasBoughtProduct) {
      return {
        success: false,
        message:
          'SECURITY POLICY: You cannot withdraw funds until you purchase at least one daily profit product starting from 5,000 RWF.'
      };
    }

    // Rule 2: Minimum withdrawal = 5,000 RWF
    if (data.amount < 5000) {
      return {
        success: false,
        message: 'Minimum withdrawal amount is 5,000 RWF.'
      };
    }

    // Rule 3: Balance check
    if (user.balance < data.amount) {
      return {
        success: false,
        message: `Your balance is only ${user.balance.toLocaleString()} RWF. You cannot withdraw ${data.amount.toLocaleString()} RWF.`
      };
    }

    // Rule 4: Phone prefix validation
    // MTN: 078 or 079
    // Airtel/Tigo: 072 or 073
    const phone = data.recipientPhone.trim().replace(/\s+/g, '');
    if (data.method === 'MTN') {
      if (!/^(078|079)\d{7}$/.test(phone)) {
        return {
          success: false,
          message: 'MTN phone numbers must start with 078 or 079 and contain 10 digits.'
        };
      }
    } else {
      if (!/^(072|073)\d{7}$/.test(phone)) {
        return {
          success: false,
          message: 'Airtel / Tigo phone numbers must start with 072 or 073 and contain 10 digits.'
        };
      }
    }

    // Rule 5: 30% Fee calculation
    const fee = Math.round(data.amount * 0.3); // 30% fee
    const netAmount = data.amount - fee;

    // Deduct total amount from user balance right now (reserved for payout)
    user.balance -= data.amount;
    saveStorage(STORAGE_KEYS.USERS, this.users);

    const withdrawal: WithdrawalRequest = {
      id: 'wd-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount: data.amount,
      fee,
      netAmount,
      method: data.method,
      recipientPhone: phone,
      recipientName: data.recipientName.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.withdrawals.unshift(withdrawal);
    saveStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);

    // Record pending transaction
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'withdrawal',
      amount: data.amount,
      direction: 'out',
      description: `Withdrawal Request: ${data.amount.toLocaleString()} RWF via ${data.method} (${phone} - ${data.recipientName}) [30% Fee: ${fee.toLocaleString()} RWF]`,
      status: 'pending',
      date: new Date().toISOString()
    };
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Notify Admin
    this.addNotification({
      title: 'New Withdrawal Request',
      message: `${user.name} requested withdrawal of ${data.amount.toLocaleString()} RWF (Payout: ${netAmount.toLocaleString()} RWF to ${data.method} - ${phone} / ${data.recipientName}).`,
      type: 'withdrawal',
      targetUserId: 'user-admin-1'
    });

    this.notify();
    return {
      success: true,
      message: `Withdrawal request for ${data.amount.toLocaleString()} RWF received! You will receive ${netAmount.toLocaleString()} RWF to ${phone}.`,
      withdrawal
    };
  }

  // Admin approves or rejects withdrawal
  public reviewWithdrawal(
    withdrawalId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const withdrawal = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) return { success: false, message: 'Withdrawal request not found.' };

    const user = this.users.find((u) => u.id === withdrawal.userId);

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.reviewedAt = new Date().toISOString();

      if (user) {
        user.totalWithdrawn += withdrawal.netAmount;
        saveStorage(STORAGE_KEYS.USERS, this.users);

        // Update transaction status
        const tx = this.transactions.find(
          (t) => t.userId === user.id && t.type === 'withdrawal' && t.amount === withdrawal.amount && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'completed';
          tx.notes = `Approved by Admin. Net payout ${withdrawal.netAmount.toLocaleString()} RWF sent to ${withdrawal.recipientPhone} (${withdrawal.recipientName}).`;
        }

        // Add 30% Fee Transaction record
        const feeTx: Transaction = {
          id: 'tx-fee-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'withdrawal_fee',
          amount: withdrawal.fee,
          direction: 'out',
          description: `30% Withdrawal Fee on ${withdrawal.amount.toLocaleString()} RWF`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(feeTx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

        // Notify user
        this.addNotification({
          title: 'Your Withdrawal Has Been Paid!',
          message: `Payout of ${withdrawal.netAmount.toLocaleString()} RWF has been successfully sent to your Mobile Money number ${withdrawal.recipientPhone} (${withdrawal.method}). Thank you!`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      withdrawal.status = 'rejected';
      withdrawal.reviewedAt = new Date().toISOString();
      withdrawal.rejectionReason = rejectionReason || 'Phone number or account name mismatch on Mobile Money.';

      // Refund the total amount back to user's balance!
      if (user) {
        user.balance += withdrawal.amount;
        saveStorage(STORAGE_KEYS.USERS, this.users);

        // Update transaction
        const tx = this.transactions.find(
          (t) => t.userId === user.id && t.type === 'withdrawal' && t.amount === withdrawal.amount && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'rejected';
          tx.notes = `Rejected by Admin. Reason: ${withdrawal.rejectionReason}. Full amount refunded to balance.`;
        }

        // Add refund transaction
        const refundTx: Transaction = {
          id: 'tx-ref-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'withdrawal_refund',
          amount: withdrawal.amount,
          direction: 'in',
          description: `Refund: ${withdrawal.amount.toLocaleString()} RWF because withdrawal was rejected (${withdrawal.rejectionReason})`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(refundTx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

        // Notify User with clear reason
        this.addNotification({
          title: 'Withdrawal Request Rejected & Refunded',
          message: `Your withdrawal of ${withdrawal.amount.toLocaleString()} RWF was rejected. Reason: "${withdrawal.rejectionReason}". The entire amount was refunded to your wallet balance.`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    saveStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.notify();
    return {
      success: true,
      message: action === 'approve' ? 'Withdrawal Approved & Processed!' : 'Withdrawal Rejected & Funds Refunded!'
    };
  }

  // --- BROADCAST MESSAGING & NOTIFICATIONS ---
  public sendBroadcast(title: string, message: string): { success: boolean; message: string } {
    const newBroadcast: BroadcastNotification = {
      id: 'bc-' + Date.now(),
      senderName: 'Umurimo Rwanda Admin',
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      type: 'broadcast',
      targetUserId: 'ALL'
    };

    this.broadcasts.unshift(newBroadcast);
    saveStorage(STORAGE_KEYS.BROADCASTS, this.broadcasts);
    this.notify();
    return { success: true, message: 'Broadcast announcement sent to all members successfully!' };
  }

  public addNotification(data: {
    title: string;
    message: string;
    type: BroadcastNotification['type'];
    targetUserId: string;
  }): void {
    const notif: BroadcastNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      senderName: 'Umurimo Rwanda System',
      title: data.title,
      message: data.message,
      createdAt: new Date().toISOString(),
      type: data.type,
      targetUserId: data.targetUserId,
      read: false
    };

    this.broadcasts.unshift(notif);
    saveStorage(STORAGE_KEYS.BROADCASTS, this.broadcasts);
    this.notify();
  }

  // --- LIVE CHAT & SUPPORT TICKETING ---
  public sendChatMessage(senderId: string, message: string, receiverId: string = 'admin'): { success: boolean } {
    const sender = this.users.find((u) => u.id === senderId);
    if (!sender) return { success: false };

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.chats.push(newMsg);
    saveStorage(STORAGE_KEYS.CHATS, this.chats);
    this.notify();
    return { success: true };
  }

  // --- DAILY CHECK-IN SYSTEM (24-Hour Cycle) ---
  public static readonly DAILY_REWARDS = [100, 150, 200, 250, 300, 400, 600]; // Day 1 to Day 7 RWF

  public getDailyCheckInStatus(userId: string): {
    canClaim: boolean;
    remainingMs: number;
    currentStreak: number;
    nextStreak: number;
    nextReward: number;
    lastClaimAt?: string;
    rewards: number[];
    totalEarned: number;
  } {
    const rewards = AppStore.DAILY_REWARDS;
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return {
        canClaim: false,
        remainingMs: 0,
        currentStreak: 0,
        nextStreak: 1,
        nextReward: rewards[0],
        rewards,
        totalEarned: 0
      };
    }

    const now = Date.now();
    const DAY_MS = 24 * 3600 * 1000;
    const TWO_DAYS_MS = 48 * 3600 * 1000;

    if (!user.lastDailyCheckInAt) {
      return {
        canClaim: true,
        remainingMs: 0,
        currentStreak: 0,
        nextStreak: 1,
        nextReward: rewards[0],
        rewards,
        totalEarned: user.totalDailyCheckInEarned || 0
      };
    }

    const lastTime = new Date(user.lastDailyCheckInAt).getTime();
    const elapsed = now - lastTime;

    if (elapsed < DAY_MS) {
      const remainingMs = DAY_MS - elapsed;
      const currentStreak = user.dailyCheckInStreak || 1;
      const nextStreak = (currentStreak % 7) + 1;
      return {
        canClaim: false,
        remainingMs,
        currentStreak,
        nextStreak,
        nextReward: rewards[nextStreak - 1],
        lastClaimAt: user.lastDailyCheckInAt,
        rewards,
        totalEarned: user.totalDailyCheckInEarned || 0
      };
    }

    // 24 hours have passed!
    // If more than 48 hours passed, streak is reset to 1
    const streakBroken = elapsed >= TWO_DAYS_MS;
    const nextStreak = streakBroken ? 1 : ((user.dailyCheckInStreak || 0) % 7) + 1;

    return {
      canClaim: true,
      remainingMs: 0,
      currentStreak: streakBroken ? 0 : user.dailyCheckInStreak || 0,
      nextStreak,
      nextReward: rewards[nextStreak - 1],
      lastClaimAt: user.lastDailyCheckInAt,
      rewards,
      totalEarned: user.totalDailyCheckInEarned || 0
    };
  }

  public claimDailyCheckIn(userId: string): {
    success: boolean;
    reward: number;
    streak: number;
    message: string;
  } {
    const status = this.getDailyCheckInStatus(userId);
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, reward: 0, streak: 0, message: 'User not found.' };

    if (!status.canClaim) {
      const hours = Math.floor(status.remainingMs / (3600 * 1000));
      const mins = Math.floor((status.remainingMs % (3600 * 1000)) / (60 * 1000));
      return {
        success: false,
        reward: 0,
        streak: status.currentStreak,
        message: `Daily reward already claimed! Next check-in unlocked in ${hours}h ${mins}m.`
      };
    }

    const streak = status.nextStreak;
    const reward = status.nextReward;

    user.balance += reward;
    user.totalEarned += reward;
    user.dailyCheckInStreak = streak;
    user.totalDailyCheckInEarned = (user.totalDailyCheckInEarned || 0) + reward;
    user.lastDailyCheckInAt = new Date().toISOString();

    if (this.currentUser?.id === userId) {
      this.currentUser = { ...user };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }
    saveStorage(STORAGE_KEYS.USERS, this.users);

    // Record Transaction
    const tx: Transaction = {
      id: 'tx-checkin-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'daily_checkin',
      amount: reward,
      direction: 'in',
      description: `Daily Check-in Reward (Day ${streak} Streak): +${reward.toLocaleString()} RWF`,
      status: 'completed',
      date: new Date().toISOString()
    };
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Notify User
    this.addNotification({
      title: `Daily Check-in Claimed! (+${reward} RWF)`,
      message: `You earned +${reward.toLocaleString()} RWF for your Day ${streak} check-in streak. Keep checking in every 24 hours to earn up to 600 RWF!`,
      type: 'success',
      targetUserId: user.id
    });

    this.notify();
    return {
      success: true,
      reward,
      streak,
      message: `Success! Claimed +${reward.toLocaleString()} RWF for Day ${streak} streak.`
    };
  }

  // --- REFERRAL HELPERS ---
  public simulateReferral(
    referrerId: string,
    friendName?: string,
    friendPhone?: string
  ): { success: boolean; message: string; record?: ReferralRecord } {
    const referrer = this.users.find((u) => u.id === referrerId);
    if (!referrer) return { success: false, message: 'Referrer not found.' };

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const names = ['Kwizera Emmanuel', 'Uwamahoro Diane', 'Hakizimana Jean', 'Mukamana Sandrine', 'Tuyishime Eric'];
    const selectedName = friendName || names[Math.floor(Math.random() * names.length)];
    const selectedPhone = friendPhone || `078${Math.floor(1000000 + Math.random() * 8999999)}`;

    const bonus = 500;
    referrer.balance += bonus;
    referrer.totalEarned += bonus;
    referrer.referralEarnings = (referrer.referralEarnings || 0) + bonus;
    referrer.referralCount = (referrer.referralCount || 0) + 1;

    const record: ReferralRecord = {
      id: 'ref-' + Date.now(),
      referrerId: referrer.id,
      referrerCode: referrer.referralCode,
      referredUserId: 'user-sim-' + Date.now(),
      referredUserName: selectedName,
      referredUserPhone: selectedPhone,
      bonusEarned: bonus,
      status: 'registered',
      createdAt: new Date().toISOString()
    };

    this.referrals.unshift(record);
    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);

    if (this.currentUser?.id === referrerId) {
      this.currentUser = { ...referrer };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }
    saveStorage(STORAGE_KEYS.USERS, this.users);

    const tx: Transaction = {
      id: 'tx-ref-' + Date.now(),
      userId: referrer.id,
      userName: referrer.name,
      type: 'referral_bonus',
      amount: bonus,
      direction: 'in',
      description: `Referral Registration Bonus: +500 RWF for inviting ${selectedName}`,
      status: 'completed',
      date: new Date().toISOString()
    };
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.addNotification({
      title: 'New Friend Registered with your Link! (+500 RWF)',
      message: `${selectedName} signed up using your referral code (${referrer.referralCode}). We credited +500 RWF bonus to your wallet!`,
      type: 'success',
      targetUserId: referrer.id
    });

    this.notify();
    return {
      success: true,
      message: `Friend ${selectedName} joined via your referral link! +500 RWF added to your wallet.`,
      record
    };
  }

  // --- ADMIN REFERRAL & INVITATION MANAGEMENT ---
  public adminCreditReferralBonus(
    userId: string,
    amount: number,
    note: string
  ): { success: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'User account not found.' };
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0.' };

    user.balance += amount;
    user.totalEarned += amount;
    user.referralEarnings = (user.referralEarnings || 0) + amount;

    if (this.currentUser?.id === userId) {
      this.currentUser = { ...user };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }
    saveStorage(STORAGE_KEYS.USERS, this.users);

    const tx: Transaction = {
      id: 'tx-ref-admin-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'referral_bonus',
      amount,
      direction: 'in',
      description: `Admin Referral Bonus Grant: +${amount.toLocaleString()} RWF (${note || 'Administrative Reward'})`,
      status: 'completed',
      date: new Date().toISOString()
    };
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.addNotification({
      title: `Special Referral Reward Granted! (+${amount.toLocaleString()} RWF)`,
      message: `Administrator awarded you +${amount.toLocaleString()} RWF for your referral leadership. Note: ${note || 'Excellent community growth'}`,
      type: 'success',
      targetUserId: user.id
    });

    this.notify();
    return {
      success: true,
      message: `Successfully credited +${amount.toLocaleString()} RWF referral bonus to ${user.name}.`
    };
  }

  public adminReassignInviter(
    referredUserId: string,
    newReferrerId: string,
    creditBonus: boolean = true
  ): { success: boolean; message: string } {
    const referredUser = this.users.find((u) => u.id === referredUserId);
    const newReferrer = this.users.find((u) => u.id === newReferrerId);

    if (!referredUser) return { success: false, message: 'Invited user not found.' };
    if (!newReferrer) return { success: false, message: 'New inviter user not found.' };
    if (referredUserId === newReferrerId) {
      return { success: false, message: 'A user cannot be set as their own inviter.' };
    }

    const previousCode = referredUser.referredBy;
    const oldReferrer = previousCode
      ? this.users.find(
          (u) => u.referralCode && u.referralCode.toUpperCase() === previousCode.toUpperCase()
        )
      : undefined;

    // Adjust old referrer counts if applicable
    if (oldReferrer && oldReferrer.id !== newReferrer.id) {
      oldReferrer.referralCount = Math.max(0, (oldReferrer.referralCount || 0) - 1);
    }

    // Set new inviter
    referredUser.referredBy = newReferrer.referralCode;
    newReferrer.referralCount = (newReferrer.referralCount || 0) + 1;

    // Check if referral record already exists
    let record = this.referrals.find((r) => r.referredUserId === referredUserId);
    const bonusToGive = creditBonus ? 500 : 0;

    if (creditBonus && !newReferrer.referralLocked) {
      newReferrer.balance += bonusToGive;
      newReferrer.totalEarned += bonusToGive;
      newReferrer.referralEarnings = (newReferrer.referralEarnings || 0) + bonusToGive;

      const tx: Transaction = {
        id: 'tx-reassign-' + Date.now(),
        userId: newReferrer.id,
        userName: newReferrer.name,
        type: 'referral_bonus',
        amount: bonusToGive,
        direction: 'in',
        description: `Referral Bonus for Reassigned Member (${referredUser.name}): +500 RWF`,
        status: 'completed',
        date: new Date().toISOString()
      };
      this.transactions.unshift(tx);
      saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    }

    if (record) {
      record.referrerId = newReferrer.id;
      record.referrerCode = newReferrer.referralCode;
      record.adminNotes = `Reassigned by Admin from ${previousCode || 'None'} to ${newReferrer.referralCode}`;
      record.updatedAt = new Date().toISOString();
      if (creditBonus) {
        record.bonusEarned = (record.bonusEarned || 0) + bonusToGive;
      }
    } else {
      record = {
        id: 'ref-' + Date.now(),
        referrerId: newReferrer.id,
        referrerCode: newReferrer.referralCode,
        referredUserId: referredUser.id,
        referredUserName: referredUser.name,
        referredUserPhone: referredUser.phone,
        bonusEarned: bonusToGive,
        status: referredUser.hasBoughtProduct ? 'product_bought' : 'registered',
        adminNotes: `Assigned by Admin to ${newReferrer.name} (${newReferrer.referralCode})`,
        createdAt: new Date().toISOString()
      };
      this.referrals.unshift(record);
    }

    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);

    if (this.currentUser?.id === newReferrer.id) {
      this.currentUser = { ...newReferrer };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    } else if (this.currentUser?.id === referredUser.id) {
      this.currentUser = { ...referredUser };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    this.addNotification({
      title: 'Referral Inviter Updated',
      message: `Your account inviter was linked to ${newReferrer.name} (${newReferrer.referralCode}) by the administrator.`,
      type: 'info',
      targetUserId: referredUser.id
    });

    this.notify();
    return {
      success: true,
      message: `Successfully linked ${referredUser.name} to inviter ${newReferrer.name} (${newReferrer.referralCode}).`
    };
  }

  public adminCreateReferralPair(
    referrerId: string,
    referredUserId: string,
    bonusAmount: number = 500,
    markProductBought: boolean = false
  ): { success: boolean; message: string } {
    const referrer = this.users.find((u) => u.id === referrerId);
    const referred = this.users.find((u) => u.id === referredUserId);

    if (!referrer) return { success: false, message: 'Selected inviter was not found.' };
    if (!referred) return { success: false, message: 'Selected invited user was not found.' };
    if (referrerId === referredUserId) {
      return { success: false, message: 'Cannot link a member to themselves.' };
    }

    referred.referredBy = referrer.referralCode;
    if (markProductBought) {
      referred.hasBoughtProduct = true;
    }

    referrer.referralCount = (referrer.referralCount || 0) + 1;
    if (bonusAmount > 0 && !referrer.referralLocked) {
      referrer.balance += bonusAmount;
      referrer.totalEarned += bonusAmount;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + bonusAmount;

      const tx: Transaction = {
        id: 'tx-pair-' + Date.now(),
        userId: referrer.id,
        userName: referrer.name,
        type: 'referral_bonus',
        amount: bonusAmount,
        direction: 'in',
        description: `Referral Link Creation Bonus for ${referred.name}: +${bonusAmount.toLocaleString()} RWF`,
        status: 'completed',
        date: new Date().toISOString()
      };
      this.transactions.unshift(tx);
      saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    }

    const newRecord: ReferralRecord = {
      id: 'ref-' + Date.now(),
      referrerId: referrer.id,
      referrerCode: referrer.referralCode,
      referredUserId: referred.id,
      referredUserName: referred.name,
      referredUserPhone: referred.phone,
      bonusEarned: bonusAmount,
      status: (markProductBought || referred.hasBoughtProduct) ? 'product_bought' : 'registered',
      adminNotes: 'Manually connected in Admin Referral Hub',
      createdAt: new Date().toISOString()
    };

    this.referrals.unshift(newRecord);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);

    this.notify();
    return {
      success: true,
      message: `Created verified referral connection: ${referrer.name} ➔ ${referred.name}`
    };
  }

  public adminUpdateReferralStatus(
    recordId: string,
    status: 'registered' | 'product_bought' | 'active' | 'revoked',
    adminNotes?: string
  ): { success: boolean; message: string } {
    const record = this.referrals.find((r) => r.id === recordId);
    if (!record) return { success: false, message: 'Referral connection record not found.' };

    record.status = status;
    if (adminNotes !== undefined) {
      record.adminNotes = adminNotes;
    }
    record.updatedAt = new Date().toISOString();

    // If marked product_bought, sync user
    if (status === 'product_bought') {
      const user = this.users.find((u) => u.id === record.referredUserId);
      if (user && !user.hasBoughtProduct) {
        user.hasBoughtProduct = true;
        saveStorage(STORAGE_KEYS.USERS, this.users);
      }
    }

    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);
    this.notify();
    return {
      success: true,
      message: `Referral status updated to "${status}".`
    };
  }

  public adminRevokeReferral(
    recordId: string,
    reason: string,
    deductBonus: boolean = true
  ): { success: boolean; message: string } {
    const record = this.referrals.find((r) => r.id === recordId);
    if (!record) return { success: false, message: 'Referral record not found.' };

    const referrer = this.users.find((u) => u.id === record.referrerId);

    if (referrer) {
      referrer.referralCount = Math.max(0, (referrer.referralCount || 0) - 1);

      if (deductBonus && record.bonusEarned > 0) {
        const toDeduct = Math.min(referrer.balance, record.bonusEarned);
        referrer.balance = Math.max(0, referrer.balance - toDeduct);
        referrer.referralEarnings = Math.max(0, (referrer.referralEarnings || 0) - record.bonusEarned);

        const tx: Transaction = {
          id: 'tx-rev-' + Date.now(),
          userId: referrer.id,
          userName: referrer.name,
          type: 'referral_bonus',
          amount: record.bonusEarned,
          direction: 'out',
          description: `Referral Bonus Revoked: -${record.bonusEarned.toLocaleString()} RWF (${reason || 'Audit reversal'})`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(tx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
      }
      saveStorage(STORAGE_KEYS.USERS, this.users);
    }

    record.status = 'revoked';
    record.adminNotes = `Revoked: ${reason || 'Administrative action'}`;
    record.updatedAt = new Date().toISOString();

    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);
    this.notify();
    return {
      success: true,
      message: `Referral record revoked successfully.${deductBonus ? ' Associated bonus was deducted.' : ''}`
    };
  }

  public adminUpdateUserReferralCode(
    userId: string,
    newCode: string
  ): { success: boolean; message: string } {
    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, message: 'Referral code must be at least 3 alphanumeric characters.' };
    }

    const collision = this.users.find(
      (u) => u.id !== userId && u.referralCode && u.referralCode.toUpperCase() === cleanCode
    );
    if (collision) {
      return { success: false, message: `Code "${cleanCode}" is already taken by ${collision.name}.` };
    }

    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const oldCode = user.referralCode;
    user.referralCode = cleanCode;

    // Update referrals where this user is the referrer
    this.referrals.forEach((r) => {
      if (r.referrerId === userId || r.referrerCode === oldCode) {
        r.referrerCode = cleanCode;
      }
    });

    // Update invitees who had this old code
    this.users.forEach((u) => {
      if (u.referredBy && u.referredBy.toUpperCase() === oldCode.toUpperCase()) {
        u.referredBy = cleanCode;
      }
    });

    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);

    if (this.currentUser?.id === userId) {
      this.currentUser = { ...user };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    this.notify();
    return {
      success: true,
      message: `Referral code for ${user.name} successfully updated to "${cleanCode}".`
    };
  }

  public adminToggleReferralLock(
    userId: string
  ): { success: boolean; isLocked: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, isLocked: false, message: 'User not found.' };

    user.referralLocked = !user.referralLocked;
    const isLocked = !!user.referralLocked;

    saveStorage(STORAGE_KEYS.USERS, this.users);
    if (this.currentUser?.id === userId) {
      this.currentUser = { ...user };
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    this.notify();
    return {
      success: true,
      isLocked,
      message: isLocked
        ? `Referral rewards locked for ${user.name}. They will not receive bonuses.`
        : `Referral rewards unlocked for ${user.name}.`
    };
  }

  public adminAdjustReferralRecordBonus(
    recordId: string,
    newBonusAmount: number,
    reason: string
  ): { success: boolean; message: string } {
    const record = this.referrals.find((r) => r.id === recordId);
    if (!record) return { success: false, message: 'Referral record not found.' };

    const oldBonus = record.bonusEarned || 0;
    const diff = newBonusAmount - oldBonus;

    const referrer = this.users.find((u) => u.id === record.referrerId);
    if (referrer && diff !== 0) {
      referrer.balance = Math.max(0, referrer.balance + diff);
      referrer.totalEarned = Math.max(0, referrer.totalEarned + diff);
      referrer.referralEarnings = Math.max(0, (referrer.referralEarnings || 0) + diff);

      const tx: Transaction = {
        id: 'tx-adj-' + Date.now(),
        userId: referrer.id,
        userName: referrer.name,
        type: 'referral_bonus',
        amount: Math.abs(diff),
        direction: diff > 0 ? 'in' : 'out',
        description: `Admin Referral Bonus Adjustment (${diff > 0 ? '+' : '-'}${Math.abs(diff).toLocaleString()} RWF): ${reason || 'Correction'}`,
        status: 'completed',
        date: new Date().toISOString()
      };
      this.transactions.unshift(tx);
      saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
      saveStorage(STORAGE_KEYS.USERS, this.users);
    }

    record.bonusEarned = newBonusAmount;
    record.adminNotes = `Bonus adjusted to ${newBonusAmount.toLocaleString()} RWF: ${reason || 'Admin modification'}`;
    record.updatedAt = new Date().toISOString();

    saveStorage(STORAGE_KEYS.REFERRALS, this.referrals);
    this.notify();
    return {
      success: true,
      message: `Bonus adjusted to ${newBonusAmount.toLocaleString()} RWF.`
    };
  }
}

export const store = new AppStore();
