/**
 * Hexagonal Ports for `bricks/user-profile` (FEAT-120)
 *
 * Pure TypeScript/ESM interfaces with zero brand, database, or framework coupling.
 * All host repositories implement these ports inside `src/adapters/`.
 */

export type SocialProviderId = 'google' | 'facebook' | 'apple' | 'microsoft';
export type BrickPlatform = 'web' | 'ios' | 'android';

export interface LinkedSocialAccount {
  provider: SocialProviderId;
  providerAccountId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: number | null;
  scopes?: string[];
  connectedAt?: string;
}

export interface NormalizedUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  hasPassword: boolean;
  isSyntheticEmail: boolean;
  syntheticProvider?: SocialProviderId | null;
  connectedProviders: Record<SocialProviderId, {
    connected: boolean;
    subjectId?: string | null;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    label: string;
  }>;
  preferences: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface OAuthNormalizedIdentity {
  provider: SocialProviderId;
  subjectId: string;
  email?: string | null;
  emailVerified?: boolean;
  isPrivateRelayEmail?: boolean;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string | null;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresInSeconds?: number;
  scopes?: string[];
  raw?: Record<string, unknown>;
}

/**
 * Storage Port: Abstracts PostgreSQL / Prisma (normalized `oauth_accounts` or JSONB `profile`).
 */
export interface UserProfileStoragePort {
  findUserById(userId: string): Promise<Record<string, any> | null>;
  findUserByEmail(email: string): Promise<Record<string, any> | null>;
  findUserByProviderSubject(provider: SocialProviderId, subjectId: string): Promise<Record<string, any> | null>;
  createUser(input: {
    email: string;
    passwordHash?: string | null;
    role?: string;
    profile: Record<string, any>;
  }): Promise<Record<string, any>>;
  updateUser(userId: string, patch: {
    email?: string;
    passwordHash?: string | null;
    profile?: Record<string, any>;
  }): Promise<Record<string, any>>;
  deleteUser(userId: string): Promise<void>;
  exportUserData?(userId: string): Promise<Record<string, any>>;
}

/**
 * OAuth Provider Port: Abstracts authorization URL creation, code exchange, and token verification.
 */
export interface OAuthProviderPort {
  readonly provider: SocialProviderId;
  buildAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    platform?: BrickPlatform;
    scopes?: string[];
    codeChallenge?: string;
    prompt?: string;
  }): string;
  authenticate(params: {
    code?: string;
    idToken?: string;
    accessToken?: string;
    redirectUri?: string;
    codeVerifier?: string;
    platform?: BrickPlatform;
    firstLoginUserHint?: { firstName?: string; lastName?: string; email?: string };
  }): Promise<OAuthNormalizedIdentity>;
  revokeToken?(token: string, tokenTypeHint?: 'access_token' | 'refresh_token'): Promise<void>;
}

/**
 * Session & Password Port: Abstracts JWT signing/verification and password hashing.
 */
export interface SessionTokenPort {
  signSessionToken(payload: { id: string; email: string; role?: string }): Promise<string> | string;
  verifySessionToken(token: string): Promise<{ id: string; email: string; role?: string } | null> | { id: string; email: string; role?: string } | null;
  hashPassword?(plainText: string): Promise<string>;
  verifyPassword?(plainText: string, hash: string): Promise<boolean>;
}

/**
 * Avatar Object Storage Port: Abstracts S3 / Garage / Cloudflare R2 / local uploads.
 */
export interface AvatarStoragePort {
  uploadAvatar(params: {
    userId: string;
    buffer: Uint8Array | Buffer;
    mimeType: string;
    fileName?: string;
  }): Promise<{ avatarUrl: string; storageKey: string }>;
  deleteAvatar?(storageKey: string): Promise<void>;
}

/**
 * Cross-Platform Design Token Contract (`ProfileBrandThemePort`).
 * Drives CSS Custom Properties (`--ag-profile-*`) on Web, `ProfileThemeConfiguration` on iOS,
 * and `ProfileThemeTokens` on Android with zero hardcoded brand colors in the brick.
 */
export interface ProfileBrandThemePort {
  colors: {
    primary: string;
    primaryForeground: string;
    surface: string;
    background: string;
    text: string;
    textMuted: string;
    border: string;
    danger: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    displayFontFamily?: string;
    headingScale: number;
    bodyScale: number;
  };
  radii: {
    card: string;
    button: string;
    avatar: string;
    input: string;
  };
  shadows?: {
    card?: string;
    button?: string;
  };
  mode?: 'light' | 'dark' | 'system';
  socialButtonVariant: 'filled' | 'outline' | 'minimal';
  brandAssets: {
    logoUrl?: string;
    appName: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
  };
}

/**
 * Optional Injectable UI Slots (`ProfileUISlotsPort`).
 * Allows any host application to override specific shells or buttons while preserving 100% of brick state/OAuth wiring.
 */
export interface ProfileUISlotsPort<TComponent = unknown> {
  AuthCardContainer?: TComponent;
  ProfileHeaderBanner?: TComponent;
  SocialButtonOverride?: TComponent;
  AvatarBadge?: TComponent;
  LoadingSpinner?: TComponent;
}

/**
 * Inter-Brick Domain Lifecycle Events (`ProfileLifecycleEventPort`).
 * Enables loose coupling with future bricks (Billing/Stripe, Credits, Notifications, Analytics).
 */
export interface ProfileLifecycleEventPort {
  onUserCreated?(event: { user: NormalizedUserProfile; provider?: SocialProviderId | 'password' }): Promise<void> | void;
  onUserLoggedIn?(event: { user: NormalizedUserProfile; provider: SocialProviderId | 'password'; platform: BrickPlatform }): Promise<void> | void;
  onSocialAccountLinked?(event: { user: NormalizedUserProfile; provider: SocialProviderId }): Promise<void> | void;
  onSocialAccountDisconnected?(event: { user: NormalizedUserProfile; provider: SocialProviderId }): Promise<void> | void;
  onProfileUpdated?(event: { user: NormalizedUserProfile; updatedFields: string[] }): Promise<void> | void;
  onAccountDeleted?(event: { userId: string; email: string }): Promise<void> | void;
}

/**
 * Internationalization Copy Dictionary Port (`ProfileI18nPort`).
 */
export interface ProfileI18nDictionary {
  profileSectionTitle: string;
  profileSectionSubtitle: string;
  firstNameLabel: string;
  lastNameLabel: string;
  emailLabel: string;
  syntheticEmailBanner: string;
  saveEmailButton: string;
  passwordSectionTitle: string;
  connectedAccountsTitle: string;
  connectedAccountsSubtitle: string;
  connectButton: string;
  disconnectButton: string;
  connectedBadge: string;
  deleteAccountTitle: string;
  deleteAccountConfirmMessage: string;
}

export interface ProfileI18nPort {
  locale: string;
  t(key: keyof ProfileI18nDictionary, vars?: Record<string, string>): string;
}
