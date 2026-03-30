-- Verifiable Credentials System Database Schema
-- This migration creates all necessary tables for the VC system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Issuers table - stores platform and institutional issuers
CREATE TABLE IF NOT EXISTS issuers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    did VARCHAR(255) UNIQUE, -- DID identifier (e.g., did:example:university123)
    public_key_jwk JSONB NOT NULL, -- JWK format public key
    sign_key_id VARCHAR(100) NOT NULL, -- Key identifier for verification
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verifiable Credentials table - stores issued credentials
CREATE TABLE IF NOT EXISTS verifiable_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vc_id VARCHAR(255) UNIQUE NOT NULL, -- URN identifier (e.g., urn:uuid:...)
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    issuer_id UUID NOT NULL REFERENCES issuers(id) ON DELETE RESTRICT,
    activity_id UUID, -- Reference to student activity (optional)
    credential_json JSONB NOT NULL, -- Full JSON-LD credential
    credential_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of credential
    proof JSONB NOT NULL, -- Digital signature proof
    short_token VARCHAR(50) UNIQUE, -- Short token for QR verification
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence files table - stores evidence attachments for credentials
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vc_id UUID NOT NULL REFERENCES verifiable_credentials(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_url TEXT NOT NULL, -- Signed URL or secure storage path
    thumbnail_url TEXT, -- Optional thumbnail for UI
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for integrity
    metadata JSONB, -- Additional file metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table - tracks all VC-related actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(50) NOT NULL, -- 'issued', 'revoked', 'verified', 'key_rotated', etc.
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vc_id UUID REFERENCES verifiable_credentials(id) ON DELETE SET NULL,
    issuer_id UUID REFERENCES issuers(id) ON DELETE SET NULL,
    details JSONB, -- Additional action details
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anchoring jobs table - for blockchain anchoring (optional)
CREATE TABLE IF NOT EXISTS anchoring_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merkle_root VARCHAR(66) NOT NULL, -- 0x prefixed hex
    tx_hash VARCHAR(66), -- Blockchain transaction hash
    chain VARCHAR(50) NOT NULL, -- 'ethereum', 'polygon', etc.
    block_number BIGINT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    vc_count INTEGER NOT NULL, -- Number of VCs in this batch
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Merkle proofs table - stores Merkle inclusion proofs for VCs
CREATE TABLE IF NOT EXISTS merkle_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vc_id UUID NOT NULL REFERENCES verifiable_credentials(id) ON DELETE CASCADE,
    anchoring_job_id UUID NOT NULL REFERENCES anchoring_jobs(id) ON DELETE CASCADE,
    merkle_proof JSONB NOT NULL, -- Array of proof hashes
    leaf_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verifiable_credentials_student_id ON verifiable_credentials(student_id);
CREATE INDEX IF NOT EXISTS idx_verifiable_credentials_issuer_id ON verifiable_credentials(issuer_id);
CREATE INDEX IF NOT EXISTS idx_verifiable_credentials_vc_id ON verifiable_credentials(vc_id);
CREATE INDEX IF NOT EXISTS idx_verifiable_credentials_short_token ON verifiable_credentials(short_token);
CREATE INDEX IF NOT EXISTS idx_verifiable_credentials_issued_at ON verifiable_credentials(issued_at);
CREATE INDEX IF NOT EXISTS idx_verifiable_credentials_revoked_at ON verifiable_credentials(revoked_at);

CREATE INDEX IF NOT EXISTS idx_evidence_files_vc_id ON evidence_files(vc_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_vc_id ON audit_logs(vc_id);

CREATE INDEX IF NOT EXISTS idx_merkle_proofs_vc_id ON merkle_proofs(vc_id);
CREATE INDEX IF NOT EXISTS idx_merkle_proofs_anchoring_job_id ON merkle_proofs(anchoring_job_id);

-- RLS Policies
ALTER TABLE issuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiable_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchoring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merkle_proofs ENABLE ROW LEVEL SECURITY;

-- Issuers policies (admin only)
DROP POLICY IF EXISTS "Only admins can manage issuers" ON issuers;
CREATE POLICY "Only admins can manage issuers" ON issuers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Verifiable credentials policies
DROP POLICY IF EXISTS "Students can view their own credentials" ON verifiable_credentials;
CREATE POLICY "Students can view their own credentials" ON verifiable_credentials
    FOR SELECT USING (
        student_id = (
            SELECT id FROM profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all credentials" ON verifiable_credentials;
CREATE POLICY "Admins can view all credentials" ON verifiable_credentials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Faculty can view credentials for their students" ON verifiable_credentials;
CREATE POLICY "Faculty can view credentials for their students" ON verifiable_credentials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty_assignments fa
            JOIN profiles p ON p.id = fa.student_id
            WHERE fa.faculty_id = (
                SELECT id FROM profiles 
                WHERE profiles.user_id = auth.uid()
            )
            AND fa.student_id = verifiable_credentials.student_id
        )
    );

-- Evidence files policies (inherit from VC policies)
DROP POLICY IF EXISTS "Users can view evidence for accessible credentials" ON evidence_files;
CREATE POLICY "Users can view evidence for accessible credentials" ON evidence_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM verifiable_credentials vc
            WHERE vc.id = evidence_files.vc_id
            AND (
                vc.student_id = (
                    SELECT id FROM profiles 
                    WHERE profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'faculty')
                )
            )
        )
    );

-- Audit logs policies (admin and faculty only)
DROP POLICY IF EXISTS "Admins and faculty can view audit logs" ON audit_logs;
CREATE POLICY "Admins and faculty can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'faculty')
        )
    );

-- Anchoring jobs policies (admin only)
DROP POLICY IF EXISTS "Only admins can manage anchoring jobs" ON anchoring_jobs;
CREATE POLICY "Only admins can manage anchoring jobs" ON anchoring_jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Merkle proofs policies (read-only for verification)
DROP POLICY IF EXISTS "Anyone can read merkle proofs for verification" ON merkle_proofs;
CREATE POLICY "Anyone can read merkle proofs for verification" ON merkle_proofs
    FOR SELECT USING (true);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_issuers_updated_at ON issuers;
CREATE TRIGGER update_issuers_updated_at BEFORE UPDATE ON issuers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verifiable_credentials_updated_at ON verifiable_credentials;
CREATE TRIGGER update_verifiable_credentials_updated_at BEFORE UPDATE ON verifiable_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default issuer (Smart Student Hub)
INSERT INTO issuers (id, name, did, public_key_jwk, sign_key_id, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Smart Student Hub',
    'did:example:smarthub',
    '{"kty":"EC","crv":"P-256","x":"...","y":"...","use":"sig","alg":"ES256","kid":"key-1"}',
    'key-1',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Create a function to generate short tokens
CREATE OR REPLACE FUNCTION generate_short_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate VC ID
CREATE OR REPLACE FUNCTION generate_vc_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'urn:uuid:' || uuid_generate_v4()::text;
END;
$$ LANGUAGE plpgsql;

-- Create a function to compute credential hash
CREATE OR REPLACE FUNCTION compute_credential_hash(credential_json JSONB)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(credential_json::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;
