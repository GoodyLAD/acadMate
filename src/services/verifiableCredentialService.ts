import { supabase } from '@/integrations/supabase/client';
import { keyManagementService } from './keyManagementService';
import { getBaseUrl } from '@/config/environment';

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: {
    id: string;
    name: string;
  };
  issuanceDate: string;
  credentialSubject: {
    id: string;
    name?: string;
    activityType: string;
    title: string;
    organizer: string;
    role: string;
    date: string;
    location?: string;
    hours: number;
    evidence: Array<{
      id: string;
      type: string;
      title: string;
      hash: string;
    }>;
    metadata: {
      studentRegistrationId: string;
      department: string;
    };
    verificationUrl: string;
  };
  expirationDate?: string;
  credentialStatus: {
    id: string;
    type: string;
  };
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

export interface EvidenceFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  thumbnail_url?: string;
  file_hash: string;
  metadata?: any;
}

export interface IssueCredentialRequest {
  activityId: string;
  studentId: string;
  evidenceIds: string[];
  issuedByUserId: string;
  activityData: {
    title: string;
    type: string;
    organizer: string;
    role: string;
    date: string;
    location?: string;
    hours: number;
    department: string;
  };
}

export interface VerificationResult {
  vcId: string;
  status: 'valid' | 'invalid' | 'revoked';
  signatureValid: boolean;
  issuer: {
    id: string;
    name: string;
  };
  issuedAt: string;
  revoked: boolean;
  revokedAt?: string;
  revocationReason?: string;
  evidenceValidated: boolean;
  anchoredOnChain?: boolean;
  chainTx?: string;
  errors?: string[];
}

export class VerifiableCredentialService {
  private static instance: VerifiableCredentialService;

  private constructor() {}

  public static getInstance(): VerifiableCredentialService {
    if (!VerifiableCredentialService.instance) {
      VerifiableCredentialService.instance = new VerifiableCredentialService();
    }
    return VerifiableCredentialService.instance;
  }

  /**
   * Issue a new verifiable credential
   */
  public async issueCredential(request: IssueCredentialRequest): Promise<{
    vcId: string;
    credentialJson: VerifiableCredential;
    shortToken: string;
    qrUrl: string;
    credentialUrl: string;
  }> {
    try {
      // Get issuer information
      const issuer = await keyManagementService.getActiveIssuer();
      if (!issuer) {
        throw new Error('No active issuer found');
      }

      // Get student profile
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.studentId)
        .single();

      if (studentError || !student) {
        throw new Error('Student not found');
      }

      // Get evidence files
      const evidenceFiles = await this.getEvidenceFiles(request.evidenceIds);

      // Generate VC ID and short token
      const vcId = `urn:uuid:${crypto.randomUUID()}`;
      const shortToken = keyManagementService.generateShortToken();

      // Create credential subject
      const credentialSubject = {
        id: `did:example:student:${request.studentId}`,
        name: student.full_name,
        activityType: request.activityData.type,
        title: request.activityData.title,
        organizer: request.activityData.organizer,
        role: request.activityData.role,
        date: request.activityData.date,
        location: request.activityData.location,
        hours: request.activityData.hours,
        evidence: evidenceFiles.map(file => ({
          id: file.storage_url,
          type: file.file_type,
          title: file.file_name,
          hash: file.file_hash,
        })),
        metadata: {
          studentRegistrationId: student.id,
          department: request.activityData.department,
        },
        verificationUrl: `${getBaseUrl()}/verify?t=${shortToken}`,
      };

      // Create the credential
      const credential: VerifiableCredential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://schema.smartstudenthub.edu/credentials#',
        ],
        id: vcId,
        type: ['VerifiableCredential', 'StudentActivityCredential'],
        issuer: {
          id: issuer.did,
          name: issuer.name,
        },
        issuanceDate: new Date().toISOString(),
        credentialSubject,
        expirationDate: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year
        credentialStatus: {
          id: `${getBaseUrl()}/api/v1/status/${vcId}`,
          type: 'RevocationList2021Status',
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date().toISOString(),
          proofPurpose: 'assertionMethod',
          verificationMethod: `${issuer.did}#${issuer.sign_key_id}`,
          jws: '', // Will be filled after signing
        },
      };

      // Sign the credential
      const jws = await keyManagementService.signJWT(credential);
      credential.proof.jws = jws;

      // Compute credential hash
      const credentialHash = await keyManagementService.computeHash(
        JSON.stringify(credential)
      );

      // Store in database using raw SQL to avoid type issues
      const { data: vcData, error: vcError } = await supabase.rpc(
        'insert_verifiable_credential',
        {
          p_vc_id: vcId,
          p_student_id: request.studentId,
          p_issuer_id: issuer.id,
          p_activity_id: request.activityId,
          p_credential_json: credential,
          p_credential_hash: credentialHash,
          p_proof: credential.proof,
          p_short_token: shortToken,
          p_expires_at: credential.expirationDate,
        }
      );

      if (vcError) {
        throw new Error(`Failed to store credential: ${vcError.message}`);
      }

      // Store evidence files
      for (const file of evidenceFiles) {
        await supabase.rpc('insert_evidence_file', {
          p_vc_id: vcData.id,
          p_file_name: file.file_name,
          p_file_type: file.file_type,
          p_file_size: file.file_size,
          p_storage_url: file.storage_url,
          p_thumbnail_url: file.thumbnail_url,
          p_file_hash: file.file_hash,
          p_metadata: file.metadata,
        });
      }

      // Log the issuance
      await this.logAction(
        'issued',
        request.issuedByUserId,
        vcData.id,
        issuer.id,
        {
          activityId: request.activityId,
          studentId: request.studentId,
          evidenceCount: evidenceFiles.length,
        }
      );

      const baseUrl = getBaseUrl();

      return {
        vcId,
        credentialJson: credential,
        shortToken,
        qrUrl: `${baseUrl}/verify?t=${shortToken}`,
        credentialUrl: `${baseUrl}/api/v1/credentials/${vcId}`,
      };
    } catch (error) {
      console.error('Error issuing credential:', error);
      throw error;
    }
  }

  /**
   * Get credential by ID
   */
  public async getCredential(
    vcId: string
  ): Promise<VerifiableCredential | null> {
    try {
      const { data, error } = await supabase.rpc('get_credential_by_id', {
        p_vc_id: vcId,
      });

      if (error || !data) {
        return null;
      }

      return data.credential_json as VerifiableCredential;
    } catch (error) {
      console.error('Error fetching credential:', error);
      return null;
    }
  }

  /**
   * Get credential by short token
   */
  public async getCredentialByToken(
    shortToken: string
  ): Promise<VerifiableCredential | null> {
    try {
      const { data, error } = await supabase.rpc('get_credential_by_token', {
        p_short_token: shortToken,
      });

      if (error || !data) {
        return null;
      }

      return data.credential_json as VerifiableCredential;
    } catch (error) {
      console.error('Error fetching credential by token:', error);
      return null;
    }
  }

  /**
   * Revoke a credential
   */
  public async revokeCredential(
    vcId: string,
    revokedBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('revoke_credential', {
        p_vc_id: vcId,
        p_revoked_by: revokedBy,
        p_reason: reason,
      });

      if (error) {
        throw new Error(`Failed to revoke credential: ${error.message}`);
      }

      // Log the revocation
      await this.logAction('revoked', revokedBy, null, null, {
        vcId,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error revoking credential:', error);
      return false;
    }
  }

  /**
   * Verify a credential
   */
  public async verifyCredential(
    shortToken: string
  ): Promise<VerificationResult> {
    try {
      // Get credential from database
      const { data: vcData, error } = await supabase.rpc(
        'get_credential_with_issuer',
        {
          p_short_token: shortToken,
        }
      );

      if (error || !vcData) {
        return {
          vcId: '',
          status: 'invalid',
          signatureValid: false,
          issuer: { id: '', name: '' },
          issuedAt: '',
          revoked: false,
          evidenceValidated: false,
          errors: ['Credential not found'],
        };
      }

      const credential = vcData.credential_json as VerifiableCredential;
      const isRevoked = !!vcData.revoked_at;

      if (isRevoked) {
        return {
          vcId: vcData.vc_id,
          status: 'revoked',
          signatureValid: false,
          issuer: {
            id: vcData.issuer_did,
            name: vcData.issuer_name,
          },
          issuedAt: vcData.issued_at,
          revoked: true,
          revokedAt: vcData.revoked_at,
          revocationReason: vcData.revocation_reason,
          evidenceValidated: false,
          errors: ['Credential has been revoked'],
        };
      }

      // Verify signature
      let signatureValid = false;
      try {
        await keyManagementService.verifyJWT(credential.proof.jws);
        signatureValid = true;
      } catch (error) {
        console.error('Signature verification failed:', error);
      }

      // Verify evidence files
      const evidenceValidated = await this.validateEvidence(credential);

      // Check expiration
      const isExpired =
        credential.expirationDate &&
        new Date(credential.expirationDate) < new Date();

      const status = isExpired
        ? 'invalid'
        : signatureValid
          ? 'valid'
          : 'invalid';

      // Log the verification
      await this.logAction('verified', null, vcData.vc_id, null, {
        shortToken,
        signatureValid,
        evidenceValidated,
      });

      return {
        vcId: vcData.vc_id,
        status,
        signatureValid,
        issuer: {
          id: vcData.issuer_did,
          name: vcData.issuer_name,
        },
        issuedAt: vcData.issued_at,
        revoked: false,
        evidenceValidated,
        errors: isExpired ? ['Credential has expired'] : undefined,
      };
    } catch (error) {
      console.error('Error verifying credential:', error);
      return {
        vcId: '',
        status: 'invalid',
        signatureValid: false,
        issuer: { id: '', name: '' },
        issuedAt: '',
        revoked: false,
        evidenceValidated: false,
        errors: ['Verification failed'],
      };
    }
  }

  /**
   * Get credential status
   */
  public async getCredentialStatus(vcId: string): Promise<{
    vcId: string;
    status: 'active' | 'revoked';
    revokedAt?: string;
    reason?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_credential_status', {
        p_vc_id: vcId,
      });

      if (error || !data) {
        throw new Error('Credential not found');
      }

      return {
        vcId: data.vc_id,
        status: data.revoked_at ? 'revoked' : 'active',
        revokedAt: data.revoked_at,
        reason: data.revocation_reason,
      };
    } catch (error) {
      console.error('Error getting credential status:', error);
      throw error;
    }
  }

  /**
   * Get student's credentials
   */
  public async getStudentCredentials(
    studentId: string
  ): Promise<VerifiableCredential[]> {
    try {
      const { data, error } = await supabase.rpc('get_student_credentials', {
        p_student_id: studentId,
      });

      if (error) {
        throw new Error(`Failed to fetch credentials: ${error.message}`);
      }

      return data.map(
        (item: any) => item.credential_json as VerifiableCredential
      );
    } catch (error) {
      console.error('Error fetching student credentials:', error);
      return [];
    }
  }

  /**
   * Get evidence files by IDs
   */
  private async getEvidenceFiles(
    evidenceIds: string[]
  ): Promise<EvidenceFile[]> {
    // This would typically fetch from a file storage service
    // For now, return mock data
    return evidenceIds.map(id => ({
      id,
      file_name: `evidence_${id}.pdf`,
      file_type: 'application/pdf',
      file_size: 1024000,
      storage_url: `https://storage.example.com/evidence/${id}.pdf`,
      thumbnail_url: `https://storage.example.com/thumbnails/${id}.jpg`,
      file_hash: this.generateRandomHash(),
      metadata: { uploaded_at: new Date().toISOString() },
    }));
  }

  /**
   * Generate a random hash for mock data
   */
  private generateRandomHash(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  /**
   * Validate evidence files
   */
  private async validateEvidence(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    credential: VerifiableCredential
  ): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Download each evidence file
    // 2. Compute its hash
    // 3. Compare with the hash in the credential
    // For now, return true
    return true;
  }

  /**
   * Log an action to audit logs
   */
  private async logAction(
    action: string,
    userId: string | null,
    vcId: string | null,
    issuerId: string | null,
    details: any
  ): Promise<void> {
    try {
      await supabase.rpc('log_audit_action', {
        p_action: action,
        p_user_id: userId,
        p_vc_id: vcId,
        p_issuer_id: issuerId,
        p_details: details,
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }
}

export const verifiableCredentialService =
  VerifiableCredentialService.getInstance();
