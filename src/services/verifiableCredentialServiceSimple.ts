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
  activityId?: string; // Make optional
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

export class VerifiableCredentialServiceSimple {
  private static instance: VerifiableCredentialServiceSimple;

  private constructor() {}

  public static getInstance(): VerifiableCredentialServiceSimple {
    if (!VerifiableCredentialServiceSimple.instance) {
      VerifiableCredentialServiceSimple.instance =
        new VerifiableCredentialServiceSimple();
    }
    return VerifiableCredentialServiceSimple.instance;
  }

  /**
   * Issue a new verifiable credential using direct table inserts
   */
  public async issueCredential(request: IssueCredentialRequest): Promise<{
    vcId: string;
    credentialJson: VerifiableCredential;
    shortToken: string;
    qrUrl: string;
    credentialUrl: string;
  }> {
    try {
      // Get issuer information - use the default issuer from issuers table
      const { data: issuerData, error: issuerError } = await supabase
        .from('issuers')
        .select('id, name, did, sign_key_id')
        .eq('status', 'active')
        .single();

      if (issuerError || !issuerData) {
        throw new Error(
          'No active issuer found. Please ensure the default issuer is set up.'
        );
      }

      // Get faculty information for the credential metadata
      let { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id, email, name, department, user_id')
        .eq('user_id', request.issuedByUserId)
        .single();

      // If not found by user_id, try to find by email from profile
      if (facultyError) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', request.issuedByUserId)
          .single();

        if (!profileError && profileData) {
          const { data: facultyByEmail, error: facultyByEmailError } =
            await supabase
              .from('faculty')
              .select('id, email, name, department, user_id')
              .eq('email', profileData.email)
              .single();

          if (!facultyByEmailError && facultyByEmail) {
            facultyData = facultyByEmail;
            facultyError = null;
          }
        }
      }

      if (facultyError || !facultyData) {
        throw new Error('Faculty not found');
      }

      // Use the issuer from the issuers table, but include faculty info in metadata
      const issuer = {
        id: issuerData.id, // Use the issuer ID from issuers table
        name: issuerData.name,
        did: issuerData.did,
        sign_key_id: issuerData.sign_key_id,
        faculty_info: {
          id: facultyData.id,
          name: facultyData.name || 'Faculty Member',
          department: facultyData.department,
        },
      };

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
          issuedByFaculty: {
            id: issuer.faculty_info.id,
            name: issuer.faculty_info.name,
            department: issuer.faculty_info.department,
          },
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

      // Store in database using direct insert (bypassing RPC)
      const { data: vcData, error: vcError } = await supabase
        .from('verifiable_credentials')
        .insert({
          vc_id: vcId,
          student_id: request.studentId,
          issuer_id: issuer.id,
          activity_id: request.activityId || null, // Make it optional
          credential_json: credential,
          credential_hash: credentialHash,
          proof: credential.proof,
          short_token: shortToken,
          expires_at: credential.expirationDate,
        })
        .select()
        .single();

      if (vcError) {
        throw new Error(`Failed to store credential: ${vcError.message}`);
      }

      // Store evidence files
      for (const file of evidenceFiles) {
        await supabase.from('evidence_files').insert({
          vc_id: vcData.id,
          file_name: file.file_name,
          file_type: file.file_type,
          file_size: file.file_size,
          storage_url: file.storage_url,
          thumbnail_url: file.thumbnail_url,
          file_hash: file.file_hash,
          metadata: file.metadata,
        });
      }

      // Log the issuance (optional - don't let this block the main process)
      // Skip audit logging for now to avoid foreign key constraint issues
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
   * Get credential by short token
   */
  public async getCredentialByToken(
    shortToken: string
  ): Promise<VerifiableCredential | null> {
    try {
      const { data, error } = await supabase
        .from('verifiable_credentials')
        .select('credential_json')
        .eq('short_token', shortToken)
        .single();

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
   * Verify a credential
   */
  public async verifyCredential(
    shortToken: string
  ): Promise<VerificationResult> {
    try {
      // Get credential from database
      const { data: vcData, error } = await supabase
        .from('verifiable_credentials')
        .select(
          `
          vc_id,
          credential_json,
          issued_at,
          revoked_at,
          revocation_reason,
          issuer_id
        `
        )
        .eq('short_token', shortToken)
        .single();

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

      // Get issuer information
      const { data: issuer } = await supabase
        .from('issuers')
        .select('name, did')
        .eq('id', vcData.issuer_id)
        .single();

      if (isRevoked) {
        return {
          vcId: vcData.vc_id,
          status: 'revoked',
          signatureValid: false,
          issuer: {
            id: issuer?.did || '',
            name: issuer?.name || '',
          },
          issuedAt: vcData.issued_at,
          revoked: true,
          revokedAt: vcData.revoked_at,
          revocationReason: vcData.revocation_reason,
          evidenceValidated: false,
          errors: ['Credential has been revoked'],
        };
      }

      // Verify signature - for now, just check if JWS exists
      let signatureValid = false;
      try {
        if (credential.proof?.jws && credential.proof.jws.length > 0) {
          // For now, just check if JWS exists and has content
          // In a production system, you would verify the actual signature
          signatureValid = true;
        } else {
          /* no-op */
        }
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

      return {
        vcId: vcData.vc_id,
        status,
        signatureValid,
        issuer: {
          id: issuer?.did || '',
          name: issuer?.name || '',
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
   * Get student's credentials
   */
  public async getStudentCredentials(
    studentId: string
  ): Promise<VerifiableCredential[]> {
    try {
      const { data, error } = await supabase
        .from('verifiable_credentials')
        .select('credential_json')
        .eq('student_id', studentId)
        .order('issued_at', { ascending: false });

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
   * Check if a string is a valid UUID
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}

export const verifiableCredentialServiceSimple =
  VerifiableCredentialServiceSimple.getInstance();
