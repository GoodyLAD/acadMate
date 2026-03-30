import { ethers } from 'ethers';

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category:
    | 'academic'
    | 'co-curricular'
    | 'professional'
    | 'creative'
    | 'technical'
    | 'extracurricular';
  issuer: string;
  timestamp: number;
  verified: boolean;
  nftTokenId?: string;
  blockchainHash?: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<WalletInfo> {
    try {
      if (!window.ethereum) {
        throw new Error(
          'MetaMask not installed. Please install MetaMask to continue.'
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Get network info
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(accounts[0]);

      // Check if we're on Polygon Mumbai testnet
      if (network.chainId !== 80001) {
        // Switch to Polygon Mumbai testnet
        await this.switchToPolygonMumbai();
      }

      return {
        address: accounts[0],
        balance: ethers.utils.formatEther(balance),
        network: network.name || 'Polygon Mumbai',
        isConnected: true,
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchToPolygonMumbai() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }], // Polygon Mumbai chainId
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x13881',
              chainName: 'Polygon Mumbai',
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://mumbai.polygonscan.com'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  async mintAchievement(achievement: Achievement): Promise<string> {
    try {
      // For now, we'll simulate the minting process
      // In a real implementation, you'd deploy a smart contract
      const mockTokenId = Math.random().toString(36).substr(2, 9);

      // Create a simple hash for verification
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const achievementData = `${achievement.studentId}-${achievement.title}-${achievement.timestamp}`;
      // Simulate a delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 2000));

      return mockTokenId;
    } catch (error) {
      console.error('Error minting achievement:', error);
      throw error;
    }
  }

  async getStudentAchievements(studentId: string): Promise<Achievement[]> {
    try {
      // For now, return mock data
      // In a real implementation, this would query the smart contract
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          studentId: studentId,
          title: 'Hackathon Winner',
          description: 'Won first place in university hackathon',
          category: 'co-curricular',
          issuer: 'University Tech Club',
          timestamp: Date.now() - 86400000, // 1 day ago
          verified: true,
          nftTokenId: 'mock-1',
          blockchainHash: '0x1234567890abcdef',
        },
        {
          id: '2',
          studentId: studentId,
          title: 'Research Paper Published',
          description: 'Published paper in IEEE conference',
          category: 'academic',
          issuer: 'IEEE',
          timestamp: Date.now() - 172800000, // 2 days ago
          verified: true,
          nftTokenId: 'mock-2',
          blockchainHash: '0xabcdef1234567890',
        },
      ];

      return mockAchievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verifyAchievement(tokenId: string): Promise<boolean> {
    try {
      // For now, return true for all mock achievements
      // In a real implementation, this would query the smart contract
      return true;
    } catch (error) {
      console.error('Error verifying achievement:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }
}

export const blockchainService = new BlockchainService();
