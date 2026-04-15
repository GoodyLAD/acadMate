import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink,
  Eye,
  Star,
  Calendar,
  Edit,
  Trash2,
  Code,
  Palette,
  BookOpen,
  Briefcase,
  Award,
  Globe,
  Lock,
  Users,
  Github,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useStudent, StudentPortfolio } from '@/hooks/useStudent';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import GitHubService, { GitHubRepository } from '@/services/githubService';

const MyProjectsPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signOut } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { profile } = useProfile();
  const {
    portfolio,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    loading,
  } = useStudent();
  const navigate = useNavigate();
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProject, setSelectedProject] =
    useState<StudentPortfolio | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showGithubImportDialog, setShowGithubImportDialog] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [githubLoading, setGithubLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [editProject, setEditProject] = useState<StudentPortfolio | null>(null);
  const [githubProjects, setGithubProjects] = useState<GitHubRepository[]>([]);
  const [isGithubConnected, setIsGithubConnected] = useState(
    GitHubService.getInstance().isAuthenticated()
  );

  // Form state for new project
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'project',
    image_url: '',
    external_url: '',
    visibility: 'public' as 'public' | 'private' | 'connections_only',
    featured: false,
  });

  // Categories with icons
  const categories = {
    project: { icon: Code, color: 'bg-blue-500', label: 'Project' },
    certificate: { icon: Award, color: 'bg-green-500', label: 'Certificate' },
    achievement: { icon: Star, color: 'bg-yellow-500', label: 'Achievement' },
    experience: {
      icon: Briefcase,
      color: 'bg-purple-500',
      label: 'Experience',
    },
    creative: { icon: Palette, color: 'bg-pink-500', label: 'Creative' },
    academic: { icon: BookOpen, color: 'bg-indigo-500', label: 'Academic' },
  };

  // Convert GitHub repositories to display format
  const githubProjectsDisplay = githubProjects.map(repo => ({
    id: `github-${repo.id}`,
    title: repo.name,
    description:
      repo.description ||
      `A ${repo.language || 'software'} project with ${repo.stargazers_count} stars and ${repo.forks_count} forks.`,
    category: 'project',
    image_url: null,
    external_url: repo.html_url,
    visibility: repo.private ? 'private' : 'public',
    featured: repo.stargazers_count > 10 || repo.forks_count > 5,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    isGithubProject: true,
    githubData: repo,
  }));

  // Combine portfolio and GitHub projects
  const allProjects = [...portfolio, ...githubProjectsDisplay];

  // Filter projects based on search and category
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || project.category === filterCategory;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'featured' && project.featured) ||
      (activeTab === 'public' && project.visibility === 'public') ||
      (activeTab === 'private' && project.visibility === 'private');

    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: 'Error',
        description: 'Project title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addPortfolioItem(newProject);
      setNewProject({
        title: '',
        description: '',
        category: 'project',
        image_url: '',
        external_url: '',
        visibility: 'public',
        featured: false,
      });
      setShowAddProjectDialog(false);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleEditProject = async () => {
    if (!editProject || !editProject.title.trim()) return;

    try {
      await updatePortfolioItem(editProject.id, editProject);
      setShowEditProjectDialog(false);
      setSelectedProject(null);
      setEditProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?'))
      return;

    try {
      await deletePortfolioItem(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openEditDialog = (project: StudentPortfolio) => {
    setSelectedProject(project);
    setEditProject({
      id: project.id,
      title: project.title,
      description: project.description || '',
      category: project.category,
      image_url: project.image_url || '',
      external_url: project.external_url || '',
      visibility: project.visibility,
      featured: project.featured,
      created_at: project.created_at,
      updated_at: project.updated_at,
    });
    setShowEditProjectDialog(true);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className='h-4 w-4' />;
      case 'private':
        return <Lock className='h-4 w-4' />;
      case 'connections_only':
        return <Users className='h-4 w-4' />;
      default:
        return <Globe className='h-4 w-4' />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'connections_only':
        return 'Connections Only';
      default:
        return 'Public';
    }
  };

  // GitHub integration functions
  const handleGithubConnect = () => {
    setShowUsernameDialog(true);
  };

  const handleGithubDisconnect = () => {
    GitHubService.getInstance().logout();
    setIsGithubConnected(false);
    setGithubProjects([]);
    setGithubRepos([]);
    toast({
      title: 'GitHub Disconnected',
      description: 'Successfully disconnected your GitHub account.',
    });
  };

  const handleUsernameSubmit = async () => {
    if (!githubUsername.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a GitHub username',
        variant: 'destructive',
      });
      return;
    }

    const githubService = GitHubService.getInstance();
    githubService.setUsername(githubUsername.trim());
    setShowUsernameDialog(false);
    setIsGithubConnected(true);

    toast({
      title: 'GitHub Connected',
      description: `Connected to @${githubUsername}`,
    });
  };

  const handleGithubImport = async () => {
    const githubService = GitHubService.getInstance();

    if (!githubService.isAuthenticated()) {
      toast({
        title: 'Not Connected',
        description: 'Please connect to GitHub first',
        variant: 'destructive',
      });
      return;
    }

    setGithubLoading(true);
    try {
      const [user, repos] = await Promise.all([
        githubService.getCurrentUser(),
        githubService.getUserRepositories({ per_page: 100 }),
      ]);

      setGithubUser(user);
      setGithubRepos(repos);
      setShowGithubImportDialog(true);
    } catch (error: any) {
      console.error('Error fetching GitHub data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch GitHub repositories',
        variant: 'destructive',
      });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleImportSelectedRepos = async () => {
    if (selectedRepos.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one repository to display',
        variant: 'destructive',
      });
      return;
    }

    setImportLoading(true);
    const reposToImport = githubRepos.filter(repo =>
      selectedRepos.has(repo.id)
    );
    try {
      // Simply add the selected repositories to the display state
      setGithubProjects(prev => {
        const newProjects = reposToImport.filter(
          repo => !prev.some(existing => existing.id === repo.id)
        );
        return [...prev, ...newProjects];
      });

      toast({
        title: 'Success',
        description: `Added ${reposToImport.length} project${reposToImport.length !== 1 ? 's' : ''} to your projects display!`,
      });

      setShowGithubImportDialog(false);
      setSelectedRepos(new Set());
    } catch (error: any) {
      console.error('Error adding repositories:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add repositories',
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
    }
  };

  const toggleRepoSelection = (repoId: number) => {
    setSelectedRepos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  };

  const selectAllRepos = () => {
    setSelectedRepos(new Set(githubRepos.map(repo => repo.id)));
  };

  const clearSelection = () => {
    setSelectedRepos(new Set());
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }`}
    >
      <div className='pt-4 px-4 py-2'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate('/')}
              className={
                isDarkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
            <div>
              <h1
                className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
              >
                My Projects
              </h1>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}
              >
                Showcase your work and achievements
              </p>
            </div>
          </div>
          <div className='flex space-x-3'>
            <Button
              onClick={() => {
                // Scroll to projects section
                const projectsSection =
                  document.querySelector('.projects-grid');
                if (projectsSection) {
                  projectsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                  });
                } else {
                  // Fallback: scroll to a specific element or position
                  const searchSection = document.querySelector(
                    '.search-filter-section'
                  );
                  if (searchSection) {
                    searchSection.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }
              }}
              variant='outline'
              className='border-green-300 text-green-700 hover:bg-green-50'
            >
              <Eye className='h-4 w-4 mr-2' />
              View Gallery
            </Button>
            {isGithubConnected ? (
              <>
                <Button
                  onClick={handleGithubDisconnect}
                  variant='outline'
                  className='border-red-300 text-red-600 hover:bg-red-50'
                >
                  Disconnect GitHub
                </Button>
                <Button
                  onClick={handleGithubImport}
                  disabled={githubLoading}
                  variant='outline'
                  className='border-gray-300 text-gray-700 hover:bg-gray-50'
                >
                  {githubLoading ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Github className='h-4 w-4 mr-2' />
                  )}
                  Import from GitHub
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGithubConnect}
                variant='outline'
                className='border-gray-300 text-gray-700 hover:bg-gray-50'
              >
                <Github className='h-4 w-4 mr-2' />
                Connect GitHub
              </Button>
            )}
            <Button
              onClick={() => setShowAddProjectDialog(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Project
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className='search-filter-section mb-6 flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search projects...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className='w-full sm:w-48'>
              <Filter className='h-4 w-4 mr-2' />
              <SelectValue placeholder='Filter by category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {Object.entries(categories).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='mb-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='all'>All Projects</TabsTrigger>
            <TabsTrigger value='featured'>Featured</TabsTrigger>
            <TabsTrigger value='public'>Public</TabsTrigger>
            <TabsTrigger value='private'>Private</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects Grid */}
        {loading ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className='text-center py-12'>
            <CardContent>
              <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No projects found
              </h3>
              <p className='text-gray-600 mb-4'>
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first project to showcase your work'}
              </p>
              <Button onClick={() => setShowAddProjectDialog(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProjects.map(project => {
              const categoryInfo =
                categories[project.category as keyof typeof categories] ||
                categories.project;
              const CategoryIcon = categoryInfo.icon;
              const isGithubProject = (project as any).isGithubProject;
              const githubData = (project as any).githubData;

              return (
                <Card
                  key={project.id}
                  className='group hover:shadow-lg transition-all duration-300'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-2'>
                        <div
                          className={`p-2 rounded-lg ${isGithubProject ? 'bg-gray-600' : categoryInfo.color}`}
                        >
                          {isGithubProject ? (
                            <Github className='h-4 w-4 text-white' />
                          ) : (
                            <CategoryIcon className='h-4 w-4 text-white' />
                          )}
                        </div>
                        <div>
                          <CardTitle className='text-lg line-clamp-1'>
                            {project.title}
                          </CardTitle>
                          <div className='flex items-center space-x-2 mt-1'>
                            <Badge variant='outline' className='text-xs'>
                              {isGithubProject
                                ? 'GitHub Project'
                                : categoryInfo.label}
                            </Badge>
                            {project.featured && (
                              <Badge variant='secondary' className='text-xs'>
                                <Star className='h-3 w-3 mr-1' />
                                Featured
                              </Badge>
                            )}
                            {isGithubProject && (
                              <Badge variant='outline' className='text-xs'>
                                {githubData?.language || 'Code'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            window.open(project.external_url || '#', '_blank')
                          }
                          className='opacity-0 group-hover:opacity-100 transition-opacity'
                          title='View Project'
                        >
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                        {!isGithubProject && (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openEditDialog(project)}
                              className='opacity-0 group-hover:opacity-100 transition-opacity'
                              title='Edit Project'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteProject(project.id)}
                              className='opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700'
                              title='Delete Project'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                        {isGithubProject && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setGithubProjects(prev =>
                                prev.filter(p => p.id !== githubData.id)
                              );
                              toast({
                                title: 'Removed',
                                description:
                                  'GitHub project removed from display',
                              });
                            }}
                            className='opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700'
                            title='Remove from Display'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.image_url && (
                      <div className='mb-4 rounded-lg overflow-hidden'>
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className='w-full h-32 object-cover'
                        />
                      </div>
                    )}

                    <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                      {project.description || 'No description provided'}
                    </p>

                    <div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
                      <div className='flex items-center space-x-1'>
                        {getVisibilityIcon(project.visibility)}
                        <span>{getVisibilityLabel(project.visibility)}</span>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <Calendar className='h-3 w-3' />
                        <span>
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {isGithubProject && githubData && (
                      <div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center space-x-1'>
                            <Star className='h-3 w-3' />
                            <span>{githubData.stargazers_count} stars</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <ExternalLink className='h-3 w-3' />
                            <span>{githubData.forks_count} forks</span>
                          </div>
                        </div>
                        <div className='text-xs text-gray-400'>
                          Updated{' '}
                          {new Date(githubData.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div className='flex gap-2'>
                      {project.external_url ? (
                        <Button
                          variant='default'
                          size='sm'
                          className='flex-1'
                          onClick={() =>
                            window.open(project.external_url, '_blank')
                          }
                        >
                          <ExternalLink className='h-4 w-4 mr-2' />
                          {isGithubProject ? 'View on GitHub' : 'View Project'}
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => {
                            // Show project details in a modal or expand the card
                            toast({
                              title: 'Project Details',
                              description: `${project.title}: ${project.description || 'No external link available'}`,
                            });
                          }}
                        >
                          <Eye className='h-4 w-4 mr-2' />
                          View Details
                        </Button>
                      )}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditDialog(project)}
                        title='Edit Project'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Project Dialog */}
        <Dialog
          open={showAddProjectDialog}
          onOpenChange={setShowAddProjectDialog}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='title'>Project Title *</Label>
                <Input
                  id='title'
                  value={newProject.title}
                  onChange={e =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  onKeyPress={e =>
                    e.key === 'Enter' &&
                    newProject.title.trim() &&
                    handleAddProject()
                  }
                  placeholder='Enter project title'
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <textarea
                  id='description'
                  value={newProject.description}
                  onChange={e =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder='Describe your project...'
                  className='w-full p-2 border rounded-md resize-none h-20'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    value={newProject.category}
                    onValueChange={value =>
                      setNewProject({ ...newProject, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='visibility'>Visibility</Label>
                  <Select
                    value={newProject.visibility}
                    onValueChange={(value: any) =>
                      setNewProject({ ...newProject, visibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='public'>Public</SelectItem>
                      <SelectItem value='private'>Private</SelectItem>
                      <SelectItem value='connections_only'>
                        Connections Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor='image_url'>Image URL</Label>
                <Input
                  id='image_url'
                  value={newProject.image_url}
                  onChange={e =>
                    setNewProject({ ...newProject, image_url: e.target.value })
                  }
                  placeholder='https://example.com/image.jpg'
                />
              </div>

              <div>
                <Label htmlFor='external_url'>External URL</Label>
                <Input
                  id='external_url'
                  value={newProject.external_url}
                  onChange={e =>
                    setNewProject({
                      ...newProject,
                      external_url: e.target.value,
                    })
                  }
                  placeholder='https://example.com/project'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='featured'
                  checked={newProject.featured}
                  onChange={e =>
                    setNewProject({ ...newProject, featured: e.target.checked })
                  }
                  className='rounded'
                />
                <Label htmlFor='featured'>Featured Project</Label>
              </div>

              <div className='flex justify-between items-center pt-4 border-t'>
                <div className='text-sm text-gray-600'>
                  {newProject.title ? (
                    <span className='text-green-600 font-medium'>
                      Ready to add "{newProject.title}"
                    </span>
                  ) : (
                    <span>Fill in the project details to continue</span>
                  )}
                </div>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowAddProjectDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProject}
                    disabled={!newProject.title.trim()}
                    className='bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Project
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog
          open={showEditProjectDialog}
          onOpenChange={setShowEditProjectDialog}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='edit-title'>Project Title *</Label>
                <Input
                  id='edit-title'
                  value={editProject?.title || ''}
                  onChange={e =>
                    setEditProject({ ...editProject!, title: e.target.value })
                  }
                  onKeyPress={e =>
                    e.key === 'Enter' &&
                    editProject?.title?.trim() &&
                    handleEditProject()
                  }
                  placeholder='Enter project title'
                />
              </div>

              <div>
                <Label htmlFor='edit-description'>Description</Label>
                <textarea
                  id='edit-description'
                  value={editProject?.description || ''}
                  onChange={e =>
                    setEditProject({
                      ...editProject!,
                      description: e.target.value,
                    })
                  }
                  placeholder='Describe your project...'
                  className='w-full p-2 border rounded-md resize-none h-20'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='edit-category'>Category</Label>
                  <Select
                    value={editProject?.category || 'project'}
                    onValueChange={value =>
                      setEditProject({ ...editProject!, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='edit-visibility'>Visibility</Label>
                  <Select
                    value={editProject?.visibility || 'public'}
                    onValueChange={(value: any) =>
                      setEditProject({ ...editProject!, visibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='public'>Public</SelectItem>
                      <SelectItem value='private'>Private</SelectItem>
                      <SelectItem value='connections_only'>
                        Connections Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor='edit-image_url'>Image URL</Label>
                <Input
                  id='edit-image_url'
                  value={editProject?.image_url || ''}
                  onChange={e =>
                    setEditProject({
                      ...editProject!,
                      image_url: e.target.value,
                    })
                  }
                  placeholder='https://example.com/image.jpg'
                />
              </div>

              <div>
                <Label htmlFor='edit-external_url'>External URL</Label>
                <Input
                  id='edit-external_url'
                  value={editProject?.external_url || ''}
                  onChange={e =>
                    setEditProject({
                      ...editProject!,
                      external_url: e.target.value,
                    })
                  }
                  placeholder='https://example.com/project'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='edit-featured'
                  checked={editProject?.featured || false}
                  onChange={e =>
                    setEditProject({
                      ...editProject!,
                      featured: e.target.checked,
                    })
                  }
                  className='rounded'
                />
                <Label htmlFor='edit-featured'>Featured Project</Label>
              </div>

              <div className='flex justify-between items-center pt-4 border-t'>
                <div className='text-sm text-gray-600'>
                  {editProject?.title ? (
                    <span className='text-green-600 font-medium'>
                      Ready to update "{editProject.title}"
                    </span>
                  ) : (
                    <span>Fill in the project details to continue</span>
                  )}
                </div>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowEditProjectDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditProject}
                    disabled={!editProject?.title?.trim()}
                    className='bg-green-600 hover:bg-green-700 text-white'
                  >
                    <Edit className='h-4 w-4 mr-2' />
                    Update Project
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* GitHub Import Dialog */}
        <Dialog
          open={showGithubImportDialog}
          onOpenChange={setShowGithubImportDialog}
        >
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Github className='h-5 w-5' />
                Add GitHub Projects to Portfolio
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4 overflow-hidden flex flex-col'>
              {githubUser && (
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <img
                    src={githubUser.avatar_url}
                    alt={githubUser.name || githubUser.login}
                    className='w-10 h-10 rounded-full'
                  />
                  <div>
                    <p className='font-semibold'>
                      {githubUser.name || githubUser.login}
                    </p>
                    <p className='text-sm text-gray-600'>@{githubUser.login}</p>
                  </div>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600'>
                  Select repositories to add to your portfolio (
                  {selectedRepos.size} selected)
                </p>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' onClick={selectAllRepos}>
                    Select All
                  </Button>
                  <Button variant='outline' size='sm' onClick={clearSelection}>
                    Clear
                  </Button>
                  <Button
                    onClick={handleImportSelectedRepos}
                    disabled={selectedRepos.size === 0 || importLoading}
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                  >
                    {importLoading ? (
                      <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                    ) : (
                      <Plus className='h-3 w-3 mr-1' />
                    )}
                    {selectedRepos.size === 0
                      ? 'Add to Portfolio'
                      : `Add ${selectedRepos.size} to Portfolio`}
                  </Button>
                  <Button
                    onClick={async () => {
                      selectAllRepos();
                      // Small delay to ensure selection is updated
                      setTimeout(() => {
                        handleImportSelectedRepos();
                      }, 100);
                    }}
                    disabled={importLoading}
                    size='sm'
                    className='bg-green-600 hover:bg-green-700 text-white'
                  >
                    {importLoading ? (
                      <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                    ) : (
                      <Plus className='h-3 w-3 mr-1' />
                    )}
                    Add All Projects
                  </Button>
                </div>
              </div>

              <div className='overflow-y-auto max-h-96 space-y-2'>
                {githubRepos.map(repo => (
                  <div
                    key={repo.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRepos.has(repo.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleRepoSelection(repo.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <input
                        type='checkbox'
                        checked={selectedRepos.has(repo.id)}
                        onChange={() => toggleRepoSelection(repo.id)}
                        className='mt-1'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='font-semibold text-sm truncate'>
                            {repo.name}
                          </h4>
                          {repo.private && (
                            <Badge variant='outline' className='text-xs'>
                              <Lock className='h-3 w-3 mr-1' />
                              Private
                            </Badge>
                          )}
                          {repo.fork && (
                            <Badge variant='outline' className='text-xs'>
                              Fork
                            </Badge>
                          )}
                        </div>
                        <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                          {repo.description || 'No description available'}
                        </p>
                        <div className='flex items-center gap-4 text-xs text-gray-500'>
                          {repo.language && (
                            <span className='flex items-center gap-1'>
                              <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                              {repo.language}
                            </span>
                          )}
                          <span className='flex items-center gap-1'>
                            <Star className='h-3 w-3' />
                            {repo.stargazers_count}
                          </span>
                          <span className='flex items-center gap-1'>
                            <ExternalLink className='h-3 w-3' />
                            {repo.forks_count} forks
                          </span>
                          <span>
                            Updated{' '}
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prominent Add Button */}
              {githubRepos.length > 0 && (
                <div className='flex justify-center pt-4'>
                  <Button
                    onClick={handleImportSelectedRepos}
                    disabled={selectedRepos.size === 0 || importLoading}
                    size='lg'
                    className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed'
                  >
                    {importLoading ? (
                      <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                    ) : (
                      <Plus className='h-5 w-5 mr-2' />
                    )}
                    {importLoading
                      ? 'Adding Projects...'
                      : selectedRepos.size === 0
                        ? 'Select Projects to Add'
                        : `Add ${selectedRepos.size} Selected Project${selectedRepos.size !== 1 ? 's' : ''} to Portfolio`}
                  </Button>
                </div>
              )}

              <div className='flex justify-between items-center pt-4 border-t'>
                <div className='text-sm text-gray-600'>
                  {selectedRepos.size > 0 ? (
                    <span className='text-green-600 font-medium'>
                      {selectedRepos.size} project
                      {selectedRepos.size !== 1 ? 's' : ''} selected
                    </span>
                  ) : (
                    <span>Select projects to import</span>
                  )}
                </div>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowGithubImportDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImportSelectedRepos}
                    disabled={selectedRepos.size === 0 || importLoading}
                    className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6'
                  >
                    {importLoading ? (
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    ) : (
                      <Plus className='h-4 w-4 mr-2' />
                    )}
                    {importLoading
                      ? 'Adding Projects...'
                      : `Add ${selectedRepos.size} Project${selectedRepos.size !== 1 ? 's' : ''} to Portfolio`}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* GitHub Username Dialog */}
        <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Github className='h-5 w-5' />
                Connect to GitHub
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='github-username'>GitHub Username</Label>
                <Input
                  id='github-username'
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  placeholder='Enter GitHub username (e.g., octocat)'
                  onKeyPress={e => e.key === 'Enter' && handleUsernameSubmit()}
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Enter any GitHub username to view their public repositories
                </p>
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowUsernameDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUsernameSubmit}>Connect</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProjectsPage;
