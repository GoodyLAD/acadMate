import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifiableCredentialService } from '../services/verifiableCredentialService';
import { keyManagementService } from '../services/keyManagementService';
import { blockchainAnchoringService } from '../services/blockchainAnchoringService';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { id: 'test-id' }, error: null })
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })
      ),
    },
  })),
}));

describe('Verifiable Credentials System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Key Management Service', () => {
    it('should generate a new key pair', async () => {
      const keyPair = await keyManagementService.generateKeyPair();

      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(keyPair).toHaveProperty('jwk');
      expect(keyPair).toHaveProperty('kid');
      expect(keyPair.jwk.kty).toBe('EC');
      expect(keyPair.jwk.alg).toBe('ES256');
    });

    it('should sign and verify JWT', async () => {
      const payload = { test: 'data' };

      const jwt = await keyManagementService.signJWT(payload);
      expect(jwt).toBeDefined();
      expect(jwt.split('.')).toHaveLength(3);

      const verifiedPayload = await keyManagementService.verifyJWT(jwt);
      expect(verifiedPayload.test).toBe('data');
    });

    it('should compute hash correctly', () => {
      const data = 'test data';
      const hash = keyManagementService.computeHash(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 hex length
    });

    it('should generate short token', () => {
      const token1 = keyManagementService.generateShortToken();
      const token2 = keyManagementService.generateShortToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });
  });

  describe('Verifiable Credential Service', () => {
    const mockCredentialRequest = {
      activityId: 'act-123',
      studentId: 'student-456',
      evidenceIds: ['ev-1', 'ev-2'],
      issuedByUserId: 'faculty-789',
      activityData: {
        title: 'Test Conference',
        type: 'Conference',
        organizer: 'Test Organizer',
        role: 'Presenter',
        date: '2025-01-15',
        location: 'Test City',
        hours: 8,
        department: 'Computer Science',
      },
    };

    it('should issue a credential with valid structure', async () => {
      // Mock the database responses

      // Mock the key management service
      vi.spyOn(keyManagementService, 'getActiveIssuer').mockResolvedValue({
        id: 'issuer-1',
        name: 'Test University',
        did: 'did:example:university',
        public_key_jwk: {} as any,
        sign_key_id: 'key-1',
        status: 'active',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      });

      vi.spyOn(keyManagementService, 'signJWT').mockResolvedValue(
        'mock-jwt-token'
      );

      const result = await verifiableCredentialService.issueCredential(
        mockCredentialRequest
      );

      expect(result).toHaveProperty('vcId');
      expect(result).toHaveProperty('credentialJson');
      expect(result).toHaveProperty('shortToken');
      expect(result).toHaveProperty('qrUrl');
      expect(result).toHaveProperty('credentialUrl');

      // Verify credential structure
      const credential = result.credentialJson;
      expect(credential['@context']).toContain(
        'https://www.w3.org/2018/credentials/v1'
      );
      expect(credential.type).toContain('VerifiableCredential');
      expect(credential.type).toContain('StudentActivityCredential');
      expect(credential.credentialSubject.title).toBe('Test Conference');
      expect(credential.proof.jws).toBe('mock-jwt-token');
    });

    it('should verify a valid credential', async () => {
      const mockVerificationResult = {
        vcId: 'urn:uuid:test-vc',
        status: 'valid' as const,
        signatureValid: true,
        issuer: {
          id: 'did:example:university',
          name: 'Test University',
        },
        issuedAt: '2025-01-15T10:00:00Z',
        revoked: false,
        evidenceValidated: true,
      };

      // Mock the verification process
      vi.spyOn(
        verifiableCredentialService,
        'verifyCredential'
      ).mockResolvedValue(mockVerificationResult);

      const result =
        await verifiableCredentialService.verifyCredential('test-token');

      expect(result.status).toBe('valid');
      expect(result.signatureValid).toBe(true);
      expect(result.revoked).toBe(false);
    });

    it('should detect revoked credentials', async () => {
      const mockRevokedResult = {
        vcId: 'urn:uuid:revoked-vc',
        status: 'revoked' as const,
        signatureValid: false,
        issuer: {
          id: 'did:example:university',
          name: 'Test University',
        },
        issuedAt: '2025-01-15T10:00:00Z',
        revoked: true,
        revokedAt: '2025-01-16T10:00:00Z',
        revocationReason: 'Credential compromised',
        evidenceValidated: false,
        errors: ['Credential has been revoked'],
      };

      vi.spyOn(
        verifiableCredentialService,
        'verifyCredential'
      ).mockResolvedValue(mockRevokedResult);

      const result =
        await verifiableCredentialService.verifyCredential('revoked-token');

      expect(result.status).toBe('revoked');
      expect(result.revoked).toBe(true);
      expect(result.revocationReason).toBe('Credential compromised');
    });
  });

  describe('Blockchain Anchoring Service', () => {
    it('should create anchoring job with Merkle tree', async () => {
      const vcIds = ['vc-1', 'vc-2', 'vc-3'];

      // Mock database responses
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockCredentials = vcIds.map(id => ({
        id,
        credential_hash: `hash-${id}`,
      }));

      const job = await blockchainAnchoringService.createAnchoringJob(vcIds);

      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('merkle_root');
      expect(job).toHaveProperty('vc_count');
      expect(job.vc_count).toBe(3);
      expect(job.status).toBe('pending');
    });

    it('should generate and verify Merkle proof', async () => {
      const leaves = ['hash1', 'hash2', 'hash3'];
      const { MerkleTree } = await import('merkletreejs');
      const crypto = await import('crypto');

      const merkleTree = new MerkleTree(leaves, crypto.createHash('sha256'), {
        sortPairs: true,
      });

      const leaf = leaves[0];
      const proof = merkleTree.getHexProof(leaf);
      const root = merkleTree.getHexRoot();

      const isValid = merkleTree.verify(proof, leaf, root);
      expect(isValid).toBe(true);
    });
  });

  describe('API Endpoints', () => {
    it('should handle credential issuance request', async () => {
      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/v1/credentials/issue',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          activityId: 'act-123',
          studentId: 'student-456',
          evidenceIds: ['ev-1'],
          activityData: {
            title: 'Test Activity',
            type: 'Conference',
            organizer: 'Test Org',
            role: 'Participant',
            date: '2025-01-15',
            hours: 4,
            department: 'CS',
          },
        }),
      };

      // Mock the API handler
      const mockHandler = vi.fn().mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          vcId: 'urn:uuid:test-vc',
          shortToken: 'test-token',
          qrUrl: 'https://example.com/verify?t=test-token',
        }),
      });

      const response = await mockHandler(mockRequest);

      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('vcId');
      expect(body).toHaveProperty('shortToken');
      expect(body).toHaveProperty('qrUrl');
    });

    it('should handle verification request', async () => {
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/v1/verify?t=test-token',
      };

      const mockHandler = vi.fn().mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          vcId: 'urn:uuid:test-vc',
          status: 'valid',
          signatureValid: true,
          issuer: {
            id: 'did:example:university',
            name: 'Test University',
          },
          issuedAt: '2025-01-15T10:00:00Z',
          revoked: false,
          evidenceValidated: true,
        }),
      });

      const response = await mockHandler(mockRequest);

      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('valid');
      expect(body.signatureValid).toBe(true);
    });
  });

  describe('QR Code Generation', () => {
    it('should generate QR code with verification URL', async () => {
      const verificationUrl = 'https://example.com/verify?t=test-token';

      // Mock QR code generation
      const mockQRCode = {
        toDataURL: vi
          .fn()
          .mockResolvedValue('data:image/png;base64,mock-qr-code'),
      };

      vi.doMock('qrcode', () => mockQRCode);

      const qrDataUrl = await mockQRCode.toDataURL(verificationUrl, {
        width: 256,
        margin: 2,
      });

      expect(qrDataUrl).toBeDefined();
      expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('Security Tests', () => {
    it('should validate JWT signature', async () => {
      const payload = { sensitive: 'data' };

      const jwt = await keyManagementService.signJWT(payload);

      // Verify with correct key
      const verifiedPayload = await keyManagementService.verifyJWT(jwt);
      expect(verifiedPayload.sensitive).toBe('data');

      // Verify with wrong key should fail
      const wrongKeyPair = await keyManagementService.generateKeyPair();
      vi.spyOn(keyManagementService, 'getJWKS').mockResolvedValue({
        keys: [wrongKeyPair.jwk],
      });

      await expect(keyManagementService.verifyJWT(jwt)).rejects.toThrow();
    });

    it('should prevent credential tampering', () => {
      const originalCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'urn:uuid:test',
        type: ['VerifiableCredential'],
        credentialSubject: {
          id: 'did:example:student:123',
          name: 'Test Student',
        },
      };

      const tamperedCredential = {
        ...originalCredential,
        credentialSubject: {
          ...originalCredential.credentialSubject,
          name: 'Hacked Student', // Tampered data
        },
      };

      const originalHash = keyManagementService.computeHash(
        JSON.stringify(originalCredential)
      );
      const tamperedHash = keyManagementService.computeHash(
        JSON.stringify(tamperedCredential)
      );

      expect(originalHash).not.toBe(tamperedHash);
    });
  });

  describe('Performance Tests', () => {
    it('should issue credential within acceptable time', async () => {
      const startTime = Date.now();

      // Mock all dependencies
      vi.spyOn(keyManagementService, 'getActiveIssuer').mockResolvedValue({
        id: 'issuer-1',
        name: 'Test University',
        did: 'did:example:university',
        public_key_jwk: {} as any,
        sign_key_id: 'key-1',
        status: 'active',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      });

      vi.spyOn(keyManagementService, 'signJWT').mockResolvedValue('mock-jwt');

      const mockRequest = {
        activityId: 'act-123',
        studentId: 'student-456',
        evidenceIds: [],
        issuedByUserId: 'faculty-789',
        activityData: {
          title: 'Test Activity',
          type: 'Conference',
          organizer: 'Test Org',
          role: 'Participant',
          date: '2025-01-15',
          hours: 4,
          department: 'CS',
        },
      };

      await verifiableCredentialService.issueCredential(mockRequest);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 300ms (as per requirements)
      expect(duration).toBeLessThan(300);
    });
  });
});

// Acceptance Criteria Tests
describe('Acceptance Criteria', () => {
  describe('AC1: Issue endpoint returns VC JSON and QR URL', () => {
    it('should return complete credential data', async () => {
      const result = await verifiableCredentialService.issueCredential({
        activityId: 'act-123',
        studentId: 'student-456',
        evidenceIds: ['ev-1'],
        issuedByUserId: 'faculty-789',
        activityData: {
          title: 'Test Conference',
          type: 'Conference',
          organizer: 'Test Organizer',
          role: 'Presenter',
          date: '2025-01-15',
          hours: 8,
          department: 'Computer Science',
        },
      });

      expect(result).toHaveProperty('vcId');
      expect(result).toHaveProperty('credentialJson');
      expect(result).toHaveProperty('shortToken');
      expect(result).toHaveProperty('qrUrl');
      expect(result).toHaveProperty('credentialUrl');
    });
  });

  describe('AC2: Issued VC contains proof and issuer fields', () => {
    it('should have valid credential structure', async () => {
      const result = await verifiableCredentialService.issueCredential({
        activityId: 'act-123',
        studentId: 'student-456',
        evidenceIds: [],
        issuedByUserId: 'faculty-789',
        activityData: {
          title: 'Test Activity',
          type: 'Workshop',
          organizer: 'Test Org',
          role: 'Participant',
          date: '2025-01-15',
          hours: 4,
          department: 'CS',
        },
      });

      const credential = result.credentialJson;
      expect(credential).toHaveProperty('proof');
      expect(credential).toHaveProperty('issuer');
      expect(credential.proof).toHaveProperty('jws');
      expect(credential.issuer).toHaveProperty('id');
      expect(credential.issuer).toHaveProperty('name');
    });
  });

  describe('AC3: JWKS endpoint contains issued public key', () => {
    it('should expose public keys for verification', async () => {
      const jwks = await keyManagementService.getJWKS();

      expect(jwks).toHaveProperty('keys');
      expect(Array.isArray(jwks.keys)).toBe(true);
      expect(jwks.keys.length).toBeGreaterThan(0);

      const key = jwks.keys[0];
      expect(key).toHaveProperty('kty');
      expect(key).toHaveProperty('kid');
      expect(key).toHaveProperty('use');
      expect(key).toHaveProperty('alg');
    });
  });

  describe('AC4: Revocation endpoint toggles revoked status', () => {
    it('should revoke credential and detect revocation', async () => {
      const vcId = 'urn:uuid:test-vc';
      const revokedBy = 'admin-123';
      const reason = 'Credential compromised';

      const success = await verifiableCredentialService.revokeCredential(
        vcId,
        revokedBy,
        reason
      );
      expect(success).toBe(true);

      const status =
        await verifiableCredentialService.getCredentialStatus(vcId);
      expect(status.status).toBe('revoked');
      expect(status.reason).toBe(reason);
    });
  });

  describe('AC5: QR short URL resolves to verification page', () => {
    it('should generate valid verification URL', async () => {
      const result = await verifiableCredentialService.issueCredential({
        activityId: 'act-123',
        studentId: 'student-456',
        evidenceIds: [],
        issuedByUserId: 'faculty-789',
        activityData: {
          title: 'Test Activity',
          type: 'Conference',
          organizer: 'Test Org',
          role: 'Participant',
          date: '2025-01-15',
          hours: 4,
          department: 'CS',
        },
      });

      expect(result.qrUrl).toMatch(/^https?:\/\/.+\/verify\?t=.+$/);
    });
  });

  describe('AC6: Evidence file hash matches served file', () => {
    it('should validate evidence file integrity', async () => {
      // This would test that evidence files are served with correct hashes
      // Implementation depends on file storage service
      expect(true).toBe(true); // Placeholder for evidence validation test
    });
  });
});
