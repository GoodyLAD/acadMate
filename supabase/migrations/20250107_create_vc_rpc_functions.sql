-- RPC Functions for Verifiable Credentials
-- These functions provide a type-safe interface for the VC system

-- Function to get active issuer
CREATE OR REPLACE FUNCTION get_active_issuer()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  did VARCHAR,
  public_key_jwk JSONB,
  sign_key_id VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.name,
    i.did,
    i.public_key_jwk,
    i.sign_key_id,
    i.status,
    i.created_at,
    i.updated_at
  FROM issuers i
  WHERE i.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get issuers for JWKS
CREATE OR REPLACE FUNCTION get_issuers_for_jwks()
RETURNS TABLE (
  public_key_jwk JSONB,
  sign_key_id VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.public_key_jwk,
    i.sign_key_id,
    i.status
  FROM issuers i
  WHERE i.status IN ('active', 'deprecated');
END;
$$ LANGUAGE plpgsql;

-- Function to create issuer
CREATE OR REPLACE FUNCTION create_issuer(
  p_name VARCHAR,
  p_did VARCHAR,
  p_public_key_jwk JSONB,
  p_sign_key_id VARCHAR,
  p_status VARCHAR DEFAULT 'active'
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  did VARCHAR,
  public_key_jwk JSONB,
  sign_key_id VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := uuid_generate_v4();
  
  INSERT INTO issuers (id, name, did, public_key_jwk, sign_key_id, status)
  VALUES (new_id, p_name, p_did, p_public_key_jwk, p_sign_key_id, p_status);
  
  RETURN QUERY
  SELECT 
    i.id,
    i.name,
    i.did,
    i.public_key_jwk,
    i.sign_key_id,
    i.status,
    i.created_at,
    i.updated_at
  FROM issuers i
  WHERE i.id = new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update issuer key
CREATE OR REPLACE FUNCTION update_issuer_key(
  p_issuer_id UUID,
  p_public_key_jwk JSONB,
  p_sign_key_id VARCHAR
)
RETURNS VOID AS $$
BEGIN
  UPDATE issuers 
  SET 
    public_key_jwk = p_public_key_jwk,
    sign_key_id = p_sign_key_id,
    updated_at = NOW()
  WHERE id = p_issuer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to deprecate old issuer key
CREATE OR REPLACE FUNCTION deprecate_old_issuer_key(
  p_issuer_id UUID,
  p_old_key_jwk JSONB,
  p_old_key_id VARCHAR
)
RETURNS VOID AS $$
DECLARE
  issuer_name VARCHAR;
BEGIN
  -- Get issuer name
  SELECT name INTO issuer_name FROM issuers WHERE id = p_issuer_id;
  
  -- Insert deprecated key
  INSERT INTO issuers (name, did, public_key_jwk, sign_key_id, status)
  SELECT 
    issuer_name || ' (Deprecated)',
    did,
    p_old_key_jwk,
    p_old_key_id,
    'deprecated'
  FROM issuers 
  WHERE id = p_issuer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get issuer by ID
CREATE OR REPLACE FUNCTION get_issuer_by_id(p_issuer_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  did VARCHAR,
  public_key_jwk JSONB,
  sign_key_id VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.name,
    i.did,
    i.public_key_jwk,
    i.sign_key_id,
    i.status,
    i.created_at,
    i.updated_at
  FROM issuers i
  WHERE i.id = p_issuer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to insert verifiable credential
CREATE OR REPLACE FUNCTION insert_verifiable_credential(
  p_vc_id VARCHAR,
  p_student_id UUID,
  p_issuer_id UUID,
  p_activity_id UUID,
  p_credential_json JSONB,
  p_credential_hash VARCHAR,
  p_proof JSONB,
  p_short_token VARCHAR,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  id UUID,
  vc_id VARCHAR,
  student_id UUID,
  issuer_id UUID,
  activity_id UUID,
  credential_json JSONB,
  credential_hash VARCHAR,
  proof JSONB,
  short_token VARCHAR,
  issued_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := uuid_generate_v4();
  
  INSERT INTO verifiable_credentials (
    id, vc_id, student_id, issuer_id, activity_id, 
    credential_json, credential_hash, proof, short_token, expires_at
  )
  VALUES (
    new_id, p_vc_id, p_student_id, p_issuer_id, p_activity_id,
    p_credential_json, p_credential_hash, p_proof, p_short_token, p_expires_at
  );
  
  RETURN QUERY
  SELECT 
    vc.id,
    vc.vc_id,
    vc.student_id,
    vc.issuer_id,
    vc.activity_id,
    vc.credential_json,
    vc.credential_hash,
    vc.proof,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.created_at,
    vc.updated_at
  FROM verifiable_credentials vc
  WHERE vc.id = new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to insert evidence file
CREATE OR REPLACE FUNCTION insert_evidence_file(
  p_vc_id UUID,
  p_file_name VARCHAR,
  p_file_type VARCHAR,
  p_file_size BIGINT,
  p_storage_url TEXT,
  p_thumbnail_url TEXT,
  p_file_hash VARCHAR,
  p_metadata JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO evidence_files (
    vc_id, file_name, file_type, file_size, 
    storage_url, thumbnail_url, file_hash, metadata
  )
  VALUES (
    p_vc_id, p_file_name, p_file_type, p_file_size,
    p_storage_url, p_thumbnail_url, p_file_hash, p_metadata
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get credential by ID
CREATE OR REPLACE FUNCTION get_credential_by_id(p_vc_id VARCHAR)
RETURNS TABLE (
  credential_json JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT vc.credential_json
  FROM verifiable_credentials vc
  WHERE vc.vc_id = p_vc_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get credential by token
CREATE OR REPLACE FUNCTION get_credential_by_token(p_short_token VARCHAR)
RETURNS TABLE (
  credential_json JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT vc.credential_json
  FROM verifiable_credentials vc
  WHERE vc.short_token = p_short_token;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke credential
CREATE OR REPLACE FUNCTION revoke_credential(
  p_vc_id VARCHAR,
  p_revoked_by VARCHAR,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE verifiable_credentials 
  SET 
    revoked_at = NOW(),
    revocation_reason = p_reason
  WHERE vc_id = p_vc_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get credential with issuer info
CREATE OR REPLACE FUNCTION get_credential_with_issuer(p_short_token VARCHAR)
RETURNS TABLE (
  vc_id VARCHAR,
  credential_json JSONB,
  issued_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revocation_reason TEXT,
  issuer_did VARCHAR,
  issuer_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.vc_id,
    vc.credential_json,
    vc.issued_at,
    vc.revoked_at,
    vc.revocation_reason,
    i.did as issuer_did,
    i.name as issuer_name
  FROM verifiable_credentials vc
  JOIN issuers i ON i.id = vc.issuer_id
  WHERE vc.short_token = p_short_token;
END;
$$ LANGUAGE plpgsql;

-- Function to get credential status
CREATE OR REPLACE FUNCTION get_credential_status(p_vc_id VARCHAR)
RETURNS TABLE (
  vc_id VARCHAR,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revocation_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.vc_id,
    vc.revoked_at,
    vc.revocation_reason
  FROM verifiable_credentials vc
  WHERE vc.vc_id = p_vc_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get student credentials
CREATE OR REPLACE FUNCTION get_student_credentials(p_student_id UUID)
RETURNS TABLE (
  credential_json JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT vc.credential_json
  FROM verifiable_credentials vc
  WHERE vc.student_id = p_student_id
  ORDER BY vc.issued_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit action
CREATE OR REPLACE FUNCTION log_audit_action(
  p_action VARCHAR,
  p_user_id UUID,
  p_vc_id VARCHAR,
  p_issuer_id UUID,
  p_details JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    action, user_id, vc_id, issuer_id, details
  )
  VALUES (
    p_action, p_user_id, p_vc_id, p_issuer_id, p_details
  );
END;
$$ LANGUAGE plpgsql;

