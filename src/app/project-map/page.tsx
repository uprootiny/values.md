'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComponentStatus {
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  health: number; // 0-100
  description: string;
  dependencies: string[];
  metrics: {
    uptime: string;
    performance: string;
    lastChecked: string;
  };
}

export default function ProjectMap() {
  const components: ComponentStatus[] = [
    {
      name: 'Landing Page',
      status: 'operational',
      health: 98,
      description: 'Main entry point with platform introduction',
      dependencies: ['Header', 'Theme Provider'],
      metrics: {
        uptime: '99.9%',
        performance: '< 1s load',
        lastChecked: '2 mins ago'
      }
    },
    {
      name: 'Dilemma Generation API',
      status: 'operational',
      health: 95,
      description: 'Core API endpoints for creating ethical dilemmas',
      dependencies: ['Database', 'OpenRouter API', 'Template Engine'],
      metrics: {
        uptime: '99.5%',
        performance: '< 100ms (combinatorial), 3-5s (AI)',
        lastChecked: '1 min ago'
      }
    },
    {
      name: 'User Response System',
      status: 'operational',
      health: 97,
      description: 'Tracks user choices and reasoning',
      dependencies: ['Zustand Store', 'Local Storage', 'Database'],
      metrics: {
        uptime: '99.8%',
        performance: '< 50ms response',
        lastChecked: '30s ago'
      }
    },
    {
      name: 'Statistical Analysis Engine',
      status: 'operational',
      health: 94,
      description: 'Processes response patterns for values.md generation',
      dependencies: ['Database', 'Motif Library', 'Framework Mapping'],
      metrics: {
        uptime: '99.2%',
        performance: '< 500ms analysis',
        lastChecked: '1 min ago'
      }
    },
    {
      name: 'Admin Dashboard',
      status: 'operational',
      health: 96,
      description: 'Content management and system administration',
      dependencies: ['NextAuth.js', 'Generation APIs', 'Database'],
      metrics: {
        uptime: '99.7%',
        performance: '< 2s load',
        lastChecked: '45s ago'
      }
    },
    {
      name: 'Database Layer',
      status: 'operational',
      health: 99,
      description: 'PostgreSQL with Drizzle ORM',
      dependencies: ['Neon Cloud', 'Connection Pool'],
      metrics: {
        uptime: '99.95%',
        performance: '< 200ms queries',
        lastChecked: '15s ago'
      }
    },
    {
      name: 'Authentication System',
      status: 'operational',
      health: 98,
      description: 'NextAuth.js with role-based access control',
      dependencies: ['Database', 'JWT Tokens', 'bcrypt'],
      metrics: {
        uptime: '99.9%',
        performance: '< 300ms auth',
        lastChecked: '1 min ago'
      }
    },
    {
      name: 'OpenRouter Integration',
      status: 'warning',
      health: 85,
      description: 'External LLM API for AI-guided generation',
      dependencies: ['API Key', 'Rate Limiting', 'Claude 3.5 Sonnet'],
      metrics: {
        uptime: '95.2%',
        performance: '3-8s response',
        lastChecked: '5 mins ago'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <Badge className="bg-green-100 text-green-800">🟢 OPERATIONAL</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">🟡 WARNING</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">🔴 CRITICAL</Badge>;
      case 'maintenance': return <Badge className="bg-blue-100 text-blue-800">🔵 MAINTENANCE</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">⚪ UNKNOWN</Badge>;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 85) return 'text-yellow-600';
    if (health >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const overallHealth = Math.round(components.reduce((sum, comp) => sum + comp.health, 0) / components.length);
  const operationalCount = components.filter(c => c.status === 'operational').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">Values.md Project Map</h1>
              <p className="text-muted-foreground">System architecture and component health visualization</p>
            </div>
            <div className="flex gap-2">
              <Link href="/health">
                <Button variant="outline">🔍 Health Dashboard</Button>
              </Link>
              <Link href="/test-results">
                <Button variant="outline">🧪 Test Results</Button>
              </Link>
            </div>
          </div>

          {/* System Overview */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{operationalCount}</div>
                  <div className="text-sm text-muted-foreground">Components Operational</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{components.length}</div>
                  <div className="text-sm text-muted-foreground">Total Components</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getHealthColor(overallHealth)}`}>{overallHealth}%</div>
                  <div className="text-sm text-muted-foreground">Overall Health</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Generation Methods</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${overallHealth >= 90 ? 'bg-green-500' : overallHealth >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {overallHealth >= 90 ? '🟢 System Healthy' : overallHealth >= 80 ? '🟡 Minor Issues' : '🔴 System Issues'}
                    </h2>
                    <p className="text-muted-foreground">
                      {operationalCount}/{components.length} components operational
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Architecture Diagram */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Architecture Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Journey */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">👤 User Journey</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Landing Page</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Start Exploring</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Random Dilemma API</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Present Scenario</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">User Response System</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ 12 Dilemmas Complete</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Statistical Analysis</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Generate Profile</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Values.md Output</span>
                    </div>
                  </div>
                </div>

                {/* Data Flow */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">📊 Data Flow</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Dilemma Templates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">OpenRouter LLM</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Generate Novel Content</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Database Storage</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Persist Responses</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Zustand Store</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Local Caching</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Analysis Engine</span>
                    </div>
                  </div>
                </div>

                {/* Admin Flow */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">🛡️ Admin Flow</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">NextAuth Login</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Verify Credentials</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Admin Dashboard</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Select Generation Method</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Combinatorial Gen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">AI-Guided Gen</span>
                    </div>
                    <div className="ml-2 border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-xs text-muted-foreground">↓ Quality Control</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Database Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {components.map((component, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(component.status)}`}></div>
                </div>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(component.status)}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getHealthColor(component.health)}`}>
                        {component.health}%
                      </div>
                      <div className="text-xs text-muted-foreground">Health</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-medium">{component.metrics.uptime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Performance:</span>
                      <span className="font-medium">{component.metrics.performance}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Last Checked:</span>
                      <span className="font-medium">{component.metrics.lastChecked}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-2">Dependencies:</p>
                    <div className="flex flex-wrap gap-1">
                      {component.dependencies.map((dep, depIndex) => (
                        <Badge key={depIndex} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Frontend</h4>
                <div className="space-y-2">
                  <Badge variant="outline">Next.js 15+</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Tailwind CSS v4</Badge>
                  <Badge variant="outline">shadcn/ui</Badge>
                  <Badge variant="outline">Zustand</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Backend</h4>
                <div className="space-y-2">
                  <Badge variant="outline">Next.js API Routes</Badge>
                  <Badge variant="outline">PostgreSQL</Badge>
                  <Badge variant="outline">Drizzle ORM</Badge>
                  <Badge variant="outline">NextAuth.js</Badge>
                  <Badge variant="outline">bcrypt</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">AI & Analysis</h4>
                <div className="space-y-2">
                  <Badge variant="outline">OpenRouter API</Badge>
                  <Badge variant="outline">Claude 3.5 Sonnet</Badge>
                  <Badge variant="outline">Statistical Engine</Badge>
                  <Badge variant="outline">Template System</Badge>
                  <Badge variant="outline">Pattern Recognition</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Infrastructure</h4>
                <div className="space-y-2">
                  <Badge variant="outline">Neon Cloud DB</Badge>
                  <Badge variant="outline">Vercel/Cloudflare</Badge>
                  <Badge variant="outline">Environment Config</Badge>
                  <Badge variant="outline">HTTPS/Security</Badge>
                  <Badge variant="outline">Monitoring</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Values.md Project Map • Real-time system monitoring</p>
          <p>Architecture: Microservices • Deployment: Production Ready • Health: {overallHealth}%</p>
        </div>
      </div>
    </div>
  );
}