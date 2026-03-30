// GitHub OAuth Configuration
const GITHUB_CONFIG = {
  clientId: 'Ov23liRiNJwonTZ5h3T6',
  clientSecret: '4fb620462437501917449f95fca6d8bccc1049aa',
  redirectUri: 'http://localhost:8080/github-callback',
  scope: 'repo user:email',
};

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  default_branch: string;
  homepage: string | null;
  size: number;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

class GitHubService {
  private static instance: GitHubService;
  private clientId = GITHUB_CONFIG.clientId;
  private redirectUri = GITHUB_CONFIG.redirectUri;
  private accessToken: string | null = null;

  private constructor() {
    // Check for stored access token
    this.accessToken = localStorage.getItem('github_access_token');
  }

  public static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  // Get GitHub OAuth URL
  public getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: GITHUB_CONFIG.scope,
      state: this.generateRandomState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // Set username for public repository access
  public setUsername(username: string): void {
    this.accessToken = 'public_user_' + username;
    localStorage.setItem('github_access_token', this.accessToken);
    localStorage.setItem('github_username', username);
  }

  // Get current username
  public getUsername(): string | null {
    return localStorage.getItem('github_username');
  }

  // Exchange code for access token - Development with Real User
  public async exchangeCodeForToken(code: string): Promise<string> {
    try {
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        // For development, we'll use a simple approach
        const demoToken = 'demo_github_token_' + Date.now();
        this.accessToken = demoToken;
        localStorage.setItem('github_access_token', demoToken);

        return demoToken;
      }

      // Production: Use Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/github-oauth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ code }),
          }
        );

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        this.accessToken = data.access_token;
        localStorage.setItem('github_access_token', data.access_token);

        return data.access_token;
      }

      throw new Error('No backend service available for token exchange');
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Get current user info
  public async getCurrentUser(): Promise<GitHubUser> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username set. Please connect to GitHub first.');
    }

    try {
      // Fetch real user data from GitHub's public API (no auth required)
      const response = await fetch(`https://api.github.com/users/${username}`);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const userData = await response.json();

      // Return the real user data
      return {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      throw error;
    }
  }

  // Get user repositories
  public async getUserRepositories(
    options: {
      type?: 'all' | 'owner' | 'public' | 'private' | 'member';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubRepository[]> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username set. Please connect to GitHub first.');
    }

    try {
      // Fetch real repositories from GitHub's public API (no auth required)
      const params = new URLSearchParams({
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: (options.per_page || 30).toString(),
        page: (options.page || 1).toString(),
      });

      const response = await fetch(
        `https://api.github.com/users/${username}/repos?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos = await response.json();

      // Return the real repository data
      return repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        topics: repo.topics || [],
        private: repo.private,
        fork: repo.fork,
        archived: repo.archived,
        disabled: repo.disabled,
        default_branch: repo.default_branch,
        homepage: repo.homepage,
        size: repo.size,
      }));
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  }

  // Get repository details
  public async getRepository(
    owner: string,
    repo: string
  ): Promise<GitHubRepository> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `token ${this.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.getUsername();
  }

  // Get stored access token
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  // Logout (clear token)
  public logout(): void {
    this.accessToken = null;
    localStorage.removeItem('github_access_token');
  }

  // Generate random state for OAuth
  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Convert GitHub repository to portfolio item format
  public convertRepositoryToPortfolioItem(repo: GitHubRepository): {
    title: string;
    description: string;
    category: string;
    image_url: string | null;
    external_url: string;
    visibility: 'public' | 'private' | 'connections_only';
    featured: boolean;
  } {
    return {
      title: repo.name,
      description:
        repo.description ||
        `A ${repo.language || 'software'} project with ${repo.stargazers_count} stars and ${repo.forks_count} forks.`,
      category: this.getCategoryFromLanguage(repo.language),
      image_url: this.getRepositoryImageUrl(repo),
      external_url: repo.html_url,
      visibility: repo.private ? 'private' : 'public',
      featured: repo.stargazers_count > 10 || repo.forks_count > 5, // Auto-feature popular repos
    };
  }

  // Get category based on programming language
  private getCategoryFromLanguage(language: string | null): string {
    if (!language) return 'project';

    const languageMap: { [key: string]: string } = {
      JavaScript: 'project',
      TypeScript: 'project',
      Python: 'project',
      Java: 'project',
      'C++': 'project',
      'C#': 'project',
      Go: 'project',
      Rust: 'project',
      PHP: 'project',
      Ruby: 'project',
      Swift: 'project',
      Kotlin: 'project',
      HTML: 'project',
      CSS: 'project',
      Vue: 'project',
      React: 'project',
      Angular: 'project',
      'Node.js': 'project',
      Dockerfile: 'project',
      Shell: 'project',
      PowerShell: 'project',
      R: 'academic',
      MATLAB: 'academic',
      'Jupyter Notebook': 'academic',
      TeX: 'academic',
      Markdown: 'creative',
      SCSS: 'creative',
      Sass: 'creative',
      Less: 'creative',
    };

    return languageMap[language] || 'project';
  }

  // Get repository image URL (using GitHub's social preview)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getRepositoryImageUrl(repo: GitHubRepository): string | null {
    // GitHub doesn't provide direct image URLs for repositories
    // We could use a service like GitHub's social preview or create our own
    // For now, return null and let the UI handle it
    return null;
  }
}

export default GitHubService;
export type { GitHubRepository, GitHubUser };
