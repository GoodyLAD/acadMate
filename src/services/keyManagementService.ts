import { supabase } from '@/integrations/supabase/client';
import {
  generateKeyPair,
  exportJWK,
  importJWK,
  SignJWT,
  jwtVerify,
} from 'jose';

export interface JWK {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
  use: string;
  alg: string;
  kid: string;
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  jwk: JWK;
  kid: string;
}

export interface Issuer {
  id: string;
  name: string;
  did: string;
  public_key_jwk: JWK;
  sign_key_id: string;
  status: 'active' | 'deprecated' | 'revoked';
  created_at: string;
  updated_at: string;
}

export class KeyManagementService {
  private static instance: KeyManagementService;
  private keyCache: Map<string, KeyPair> = new Map();
  private jwksCache: JWK[] = [];
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): KeyManagementService {
    if (!KeyManagementService.instance) {
      KeyManagementService.instance = new KeyManagementService();
    }
    return KeyManagementService.instance;
  }

  /**
   * Generate a new ECDSA P-256 key pair
   */
  public async generateKeyPair(): Promise<KeyPair> {
    const kid = `key-${Date.now()}`;

    const { publicKey, privateKey } = await generateKeyPair('ES256', {
      extractable: true,
    });

    const jwk = await exportJWK(publicKey);
    const jwkWithKid: JWK = {
      ...jwk,
      kty: jwk.kty || 'EC',
      use: 'sig',
      alg: 'ES256',
      kid,
    };

    return {
      publicKey,
      privateKey,
      jwk: jwkWithKid,
      kid,
    };
  }

  /**
   * Get or create the active issuer key
   */
  public async getActiveIssuerKey(): Promise<KeyPair> {
    const issuer = await this.getActiveIssuer();
    if (!issuer) {
      throw new Error('No active issuer found');
    }

    const cacheKey = issuer.sign_key_id;
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    // For this implementation, we'll generate a new key pair
    // but use the issuer's sign_key_id as the kid to match the database
    const keyPair = await this.generateKeyPair();
    // Override the kid to match the issuer's sign_key_id
    keyPair.jwk.kid = issuer.sign_key_id;
    keyPair.kid = issuer.sign_key_id;

    this.keyCache.set(cacheKey, keyPair);

    return keyPair;
  }

  /**
   * Get the active issuer from database
   */
  public async getActiveIssuer(): Promise<Issuer | null> {
    try {
      // Direct query instead of RPC function
      const { data, error } = await supabase
        .from('issuers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching active issuer:', error);
        return null;
      }

      return data as Issuer;
    } catch (error) {
      console.error('Error fetching active issuer:', error);
      return null;
    }
  }

  /**
   * Get JWKS (JSON Web Key Set) for verification
   */
  public async getJWKS(): Promise<{ keys: JWK[] }> {
    const now = Date.now();

    // Return cached JWKS if still valid
    if (this.jwksCache.length > 0 && now < this.cacheExpiry) {
      return { keys: this.jwksCache };
    }

    try {
      // Get the active issuer key (this ensures we use the same key as signing)
      const keyPair = await this.getActiveIssuerKey();

      // Return the key used for signing
      const keys: JWK[] = [keyPair.jwk];

      // Cache the result
      this.jwksCache = keys;
      this.cacheExpiry = now + this.CACHE_TTL;

      return { keys };
    } catch (error) {
      console.error('Error fetching JWKS:', error);
      return { keys: [] };
    }
  }

  /**
   * Create a new issuer with a key pair
   */
  public async createIssuer(name: string, did: string): Promise<Issuer> {
    const keyPair = await this.generateKeyPair();

    try {
      const { data, error } = await supabase.rpc('create_issuer', {
        p_name: name,
        p_did: did,
        p_public_key_jwk: keyPair.jwk,
        p_sign_key_id: keyPair.kid,
        p_status: 'active',
      });

      if (error) {
        throw new Error(`Failed to create issuer: ${error.message}`);
      }

      // Cache the key pair
      this.keyCache.set(keyPair.kid, keyPair);

      return data as Issuer;
    } catch (error) {
      console.error('Error creating issuer:', error);
      throw error;
    }
  }

  /**
   * Rotate issuer key (create new key, deprecate old)
   */
  public async rotateIssuerKey(issuerId: string): Promise<KeyPair> {
    const issuer = await this.getIssuerById(issuerId);
    if (!issuer) {
      throw new Error('Issuer not found');
    }

    // Generate new key pair
    const newKeyPair = await this.generateKeyPair();

    try {
      // Update issuer with new key
      const { error: updateError } = await supabase.rpc('update_issuer_key', {
        p_issuer_id: issuerId,
        p_public_key_jwk: newKeyPair.jwk,
        p_sign_key_id: newKeyPair.kid,
      });

      if (updateError) {
        throw new Error(`Failed to rotate issuer key: ${updateError.message}`);
      }

      // Deprecate old key (keep for verification of existing credentials)
      await supabase.rpc('deprecate_old_issuer_key', {
        p_issuer_id: issuerId,
        p_old_key_jwk: issuer.public_key_jwk,
        p_old_key_id: issuer.sign_key_id,
      });

      // Cache the new key pair
      this.keyCache.set(newKeyPair.kid, newKeyPair);

      return newKeyPair;
    } catch (error) {
      console.error('Error rotating issuer key:', error);
      throw error;
    }
  }

  /**
   * Get issuer by ID
   */
  public async getIssuerById(issuerId: string): Promise<Issuer | null> {
    try {
      const { data, error } = await supabase.rpc('get_issuer_by_id', {
        p_issuer_id: issuerId,
      });

      if (error) {
        console.error('Error fetching issuer:', error);
        return null;
      }

      return data as Issuer;
    } catch (error) {
      console.error('Error fetching issuer:', error);
      return null;
    }
  }

  /**
   * Sign a JWT with the active issuer key
   */
  public async signJWT(
    payload: any,
    expiresIn: string = '1y'
  ): Promise<string> {
    const keyPair = await this.getActiveIssuerKey();

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'ES256', kid: keyPair.kid })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setIssuer(keyPair.jwk.kid)
      .sign(keyPair.privateKey);
  }

  /**
   * Verify a JWT signature
   */
  public async verifyJWT(token: string): Promise<any> {
    const jwks = await this.getJWKS();

    // Find the key used to sign the JWT
    const header = JSON.parse(atob(token.split('.')[0]));
    const key = jwks.keys.find(k => k.kid === header.kid);

    if (!key) {
      throw new Error('Key not found for verification');
    }

    const publicKey = await importJWK(key, 'ES256');

    const { payload } = await jwtVerify(token, publicKey);
    return payload;
  }

  /**
   * Compute SHA-256 hash of data
   */
  public async computeHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a short token for QR codes
   */
  public generateShortToken(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Clear key cache (useful for testing)
   */
  public clearCache(): void {
    this.keyCache.clear();
    this.jwksCache = [];
    this.cacheExpiry = 0;
  }
}

export const keyManagementService = KeyManagementService.getInstance();
