import { createClient } from '@supabase/supabase-js';
import { MerkleTree } from 'merkletreejs';
import crypto from 'crypto';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

export interface AnchoringJob {
  id: string;
  merkle_root: string;
  tx_hash?: string;
  chain: string;
  block_number?: number;
  status: 'pending' | 'confirmed' | 'failed';
  vc_count: number;
  created_at: string;
  confirmed_at?: string;
}

export interface MerkleProof {
  leaf: string;
  path: string[];
  indices: number[];
  root: string;
}

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  gasLimit: number;
  gasPrice: string;
}

export class BlockchainAnchoringService {
  private static instance: BlockchainAnchoringService;
  private config: BlockchainConfig | null = null;

  private constructor() {
    this.loadConfig();
  }

  public static getInstance(): BlockchainAnchoringService {
    if (!BlockchainAnchoringService.instance) {
      BlockchainAnchoringService.instance = new BlockchainAnchoringService();
    }
    return BlockchainAnchoringService.instance;
  }

  private loadConfig() {
    // In production, load from environment variables or secure config
    this.config = {
      rpcUrl: process.env.REACT_APP_BLOCKCHAIN_RPC_URL || '',
      privateKey: process.env.REACT_APP_BLOCKCHAIN_PRIVATE_KEY || '',
      contractAddress: process.env.REACT_APP_BLOCKCHAIN_CONTRACT_ADDRESS || '',
      gasLimit: 100000,
      gasPrice: '20000000000', // 20 gwei
    };
  }

  /**
   * Create a new anchoring job for a batch of credentials
   */
  public async createAnchoringJob(vcIds: string[]): Promise<AnchoringJob> {
    try {
      // Get credentials from database
      const { data: credentials, error } = await supabase
        .from('verifiable_credentials')
        .select('id, credential_hash')
        .in('id', vcIds);

      if (error || !credentials || credentials.length === 0) {
        throw new Error('Failed to fetch credentials for anchoring');
      }

      // Create Merkle tree
      const leaves = credentials.map(cred => cred.credential_hash);
      const merkleTree = new MerkleTree(leaves, crypto.createHash('sha256'), {
        sortPairs: true,
      });

      const merkleRoot = merkleTree.getHexRoot();

      // Store anchoring job
      const { data: job, error: jobError } = await supabase
        .from('anchoring_jobs')
        .insert({
          merkle_root: merkleRoot,
          chain: 'ethereum', // or configurable
          vc_count: credentials.length,
          status: 'pending',
        })
        .select()
        .single();

      if (jobError) {
        throw new Error(`Failed to create anchoring job: ${jobError.message}`);
      }

      // Store Merkle proofs for each credential
      for (let i = 0; i < credentials.length; i++) {
        const proof = merkleTree.getHexProof(leaves[i]);

        await supabase.from('merkle_proofs').insert({
          vc_id: credentials[i].id,
          anchoring_job_id: job.id,
          merkle_proof: proof,
          leaf_index: i,
        });
      }

      // Start anchoring process (async)
      this.anchorToBlockchain(job.id, merkleRoot).catch(error => {
        console.error('Anchoring failed:', error);
        this.updateJobStatus(job.id, 'failed');
      });

      return job;
    } catch (error) {
      console.error('Error creating anchoring job:', error);
      throw error;
    }
  }

  /**
   * Anchor Merkle root to blockchain
   */
  private async anchorToBlockchain(
    jobId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    merkleRoot: string
  ): Promise<void> {
    if (!this.config) {
      throw new Error('Blockchain configuration not available');
    }

    try {
      // In a real implementation, you would:
      // 1. Connect to blockchain (Ethereum, Polygon, etc.)
      // 2. Deploy or interact with a smart contract
      // 3. Submit transaction with Merkle root
      // 4. Wait for confirmation
      // 5. Update job status

      // For this demo, we'll simulate the process
      // Simulate blockchain transaction
      const txHash = this.generateMockTxHash();
      const blockNumber = Math.floor(Math.random() * 1000000) + 18000000;

      // Update job with transaction details
      await this.updateJobStatus(jobId, 'confirmed', {
        tx_hash: txHash,
        block_number: blockNumber,
      });
    } catch (error) {
      console.error('Blockchain anchoring failed:', error);
      await this.updateJobStatus(jobId, 'failed');
      throw error;
    }
  }

  /**
   * Update anchoring job status
   */
  private async updateJobStatus(
    jobId: string,
    status: 'pending' | 'confirmed' | 'failed',
    additionalData?: { tx_hash?: string; block_number?: number }
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const { error } = await supabase
      .from('anchoring_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      console.error('Failed to update job status:', error);
    }
  }

  /**
   * Get Merkle proof for a credential
   */
  public async getMerkleProof(vcId: string): Promise<MerkleProof | null> {
    try {
      const { data, error } = await supabase
        .from('merkle_proofs')
        .select(
          `
          merkle_proof,
          leaf_index,
          anchoring_job_id,
          anchoring_jobs(merkle_root, status, tx_hash, block_number)
        `
        )
        .eq('vc_id', vcId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        leaf: data.merkle_proof[0], // First element is the leaf
        path: data.merkle_proof,
        indices: [data.leaf_index],
        root: data.anchoring_jobs.merkle_root,
      };
    } catch (error) {
      console.error('Error getting Merkle proof:', error);
      return null;
    }
  }

  /**
   * Verify Merkle proof
   */
  public verifyMerkleProof(proof: MerkleProof, leaf: string): boolean {
    try {
      const merkleTree = new MerkleTree([leaf], crypto.createHash('sha256'), {
        sortPairs: true,
      });

      return merkleTree.verify(proof.path, leaf, proof.root);
    } catch (error) {
      console.error('Error verifying Merkle proof:', error);
      return false;
    }
  }

  /**
   * Get anchoring status for a credential
   */
  public async getAnchoringStatus(vcId: string): Promise<{
    anchored: boolean;
    txHash?: string;
    blockNumber?: number;
    merkleRoot?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('merkle_proofs')
        .select(
          `
          anchoring_job_id,
          anchoring_jobs(status, tx_hash, block_number, merkle_root)
        `
        )
        .eq('vc_id', vcId)
        .single();

      if (error || !data) {
        return { anchored: false };
      }

      const job = data.anchoring_jobs;
      return {
        anchored: job.status === 'confirmed',
        txHash: job.tx_hash,
        blockNumber: job.block_number,
        merkleRoot: job.merkle_root,
      };
    } catch (error) {
      console.error('Error getting anchoring status:', error);
      return { anchored: false };
    }
  }

  /**
   * Get all pending anchoring jobs
   */
  public async getPendingJobs(): Promise<AnchoringJob[]> {
    try {
      const { data, error } = await supabase
        .from('anchoring_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch pending jobs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      return [];
    }
  }

  /**
   * Retry failed anchoring jobs
   */
  public async retryFailedJobs(): Promise<void> {
    try {
      const failedJobs = await this.getPendingJobs();

      for (const job of failedJobs) {
        if (job.status === 'pending') {
          this.anchorToBlockchain(job.id, job.merkle_root).catch(error => {
            console.error(`Retry failed for job ${job.id}:`, error);
            this.updateJobStatus(job.id, 'failed');
          });
        }
      }
    } catch (error) {
      console.error('Error retrying failed jobs:', error);
    }
  }

  /**
   * Generate mock transaction hash for demo purposes
   */
  private generateMockTxHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get anchoring statistics
   */
  public async getAnchoringStats(): Promise<{
    totalJobs: number;
    pendingJobs: number;
    confirmedJobs: number;
    failedJobs: number;
    totalCredentials: number;
  }> {
    try {
      const { data: jobs, error: jobsError } = await supabase
        .from('anchoring_jobs')
        .select('status, vc_count');

      if (jobsError) {
        throw new Error(`Failed to fetch job stats: ${jobsError.message}`);
      }

      const stats = {
        totalJobs: jobs.length,
        pendingJobs: jobs.filter(j => j.status === 'pending').length,
        confirmedJobs: jobs.filter(j => j.status === 'confirmed').length,
        failedJobs: jobs.filter(j => j.status === 'failed').length,
        totalCredentials: jobs.reduce((sum, job) => sum + job.vc_count, 0),
      };

      return stats;
    } catch (error) {
      console.error('Error getting anchoring stats:', error);
      return {
        totalJobs: 0,
        pendingJobs: 0,
        confirmedJobs: 0,
        failedJobs: 0,
        totalCredentials: 0,
      };
    }
  }
}

export const blockchainAnchoringService =
  BlockchainAnchoringService.getInstance();
