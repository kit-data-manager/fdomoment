import { NextRequest, NextResponse } from 'next/server';

type RepositoryType =
  | 'GitHub'
  | 'GitLab.com'
  | 'Codebase@Helmholtz'
  | 'GitLab@Kit'
  | 'Other';

function mapLicenseToId(licenseContent: string): string | undefined {
    console.log("CONT ", licenseContent)
  if (licenseContent.includes('MIT License') || licenseContent.includes('MIT')) {
    return 'MIT';
  } else if (licenseContent.includes('Apache License') || licenseContent.includes('Apache')) {
    return 'Apache-2.0';
  } else if (licenseContent.includes('GNU General Public License') || licenseContent.includes('GPL')) {
    return 'GPL-3.0';
  } else if (licenseContent.includes('GNU Lesser General Public License') || licenseContent.includes('LGPL')) {
    return 'LGPL-2.1';
  } else if (licenseContent.includes('ISC License') || licenseContent.includes('ISC')) {
    return 'MIT';
  } else if (licenseContent.includes('Redistributions of source code') && licenseContent.includes('Redistributions in binary form') && licenseContent.includes('Neither the name of the copyright holder')) {
    return 'BSD-3-Clause';
  } else if (licenseContent.includes('Redistributions of source code') && licenseContent.includes('Redistributions in binary form')) {
    return 'BSD-3-Clause';
  } else if (licenseContent.includes('Creative Commons Attribution 4.0 International')) {
    return 'CC-BY-4.0';
  } else if (licenseContent.includes('Creative Commons Attribution-ShareAlike 4.0 International')) {
    return 'CC-BY-SA-4.0';
  } else if (licenseContent.includes('This is free and unencumbered')) {
    return 'MIT';
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, tokens } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    let apiBase: string;
    let repoBase: string;
    let repoType: RepositoryType = 'Other';
    let hostname: string;

    try {
      const urlObj = new URL(url);
      hostname = urlObj.hostname;
      
      if (hostname === 'github.com') {
        repoType = 'GitHub';
        apiBase = 'https://api.github.com/repos';
        repoBase = 'https://github.com';
      } else if (hostname === 'gitlab.com') {
        repoType = 'GitLab.com';
        apiBase = 'https://gitlab.com/api/v4';
        repoBase = 'https://gitlab.com';
      } else if (hostname === 'gitlab.kit.edu') {
        repoType = 'GitLab@Kit';
        apiBase = 'https://gitlab.kit.edu/api/v4';
        repoBase = 'https://gitlab.kit.edu';
      } else if (hostname === 'codebase.helmholtz.cloud') {
        repoType = 'Codebase@Helmholtz';
        apiBase = 'https://codebase.helmholtz.cloud/api/v4';
        repoBase = 'https://codebase.helmholtz.cloud';
      } else {
        return NextResponse.json(
          { error: 'Unsupported repository host: ' + hostname },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid repository URL' },
        { status: 400 }
      );
    }

    const owner = pathParts[0];
    const repo = pathParts[1];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const token = tokens?.[repoType] || '';
      
      const headers: Record<string, string> = {
        'User-Agent': 'FDOCreator/1.0',
      };

      if (repoType === 'GitHub' && token) {
        headers['Authorization'] = `token ${token}`;
      } else if (token && (repoType === 'GitLab.com' || repoType === 'GitLab@Kit' || repoType === 'Codebase@Helmholtz')) {
        headers['PRIVATE-TOKEN'] = token;
      }

      let license: string = '';
      let readmeUrl: string = '';
      let projectId: number | null = null;

      if (repoType === 'GitHub') {
        const repoResponse = await fetch(`${apiBase}/${owner}/${repo}`, {
          signal: controller.signal,
          headers,
        });

        if (!repoResponse.ok) {
          clearTimeout(timeoutId);
          return NextResponse.json(
            { error: 'Repository not found' },
            { status: 404 }
          );
        }
        const repoData = await repoResponse.json() as Record<string, any>;
        
        const licenseResponse = await fetch(`${apiBase}/${owner}/${repo}/license`, {
          signal: controller.signal,
          headers,
        });
        
        if (licenseResponse.ok) {
          const licenseData = await licenseResponse.json();
          license = licenseData.license?.spdx_id || licenseData.license?.name || '';
          license = license.toLowerCase();
        }

        const defaultBranch = repoData.default_branch || 'main';
        readmeUrl = `${repoBase}/${owner}/${repo}/blob/${defaultBranch}/README.md`;

      } else if (repoType === 'GitLab.com' || repoType === 'GitLab@Kit' || repoType === 'Codebase@Helmholtz') {
        const searchResponse = await fetch(`${apiBase}/projects?search=${encodeURIComponent(owner + '/' + repo)}`, {
          signal: controller.signal,
          headers,
        });
        
        if (!searchResponse.ok) {
          clearTimeout(timeoutId);
          return NextResponse.json(
            { error: 'Repository not found' },
            { status: 404 }
          );
        }

        const searchResults = await searchResponse.json() as Record<string, any>[];
        const project = searchResults.find(p => p.path_with_namespace === `${owner}/${repo}`);
        
        if (!project) {
          clearTimeout(timeoutId);
          return NextResponse.json(
            { error: 'Repository not found' },
            { status: 404 }
          );
        }

        projectId = project.id;
        const defaultBranch = project.default_branch || 'main';

        try {
          const licenseResponse = await fetch(`${apiBase}/projects/${projectId}/repository/files/LICENSE?ref=${defaultBranch}`, {
            signal: controller.signal,
            headers,
          });

          if (licenseResponse.ok) {
            const licenseData = await licenseResponse.json();
            if (licenseData.content) {
              const licenseContent = Buffer.from(licenseData.content, 'base64').toString('utf-8');
              const mappedLicense = mapLicenseToId(licenseContent);
              license = mappedLicense || '';
            }
          }
        } catch {
        }

        readmeUrl = `${repoBase}/${owner}/${repo}/-/blob/${defaultBranch}/README.md`;
      }

      clearTimeout(timeoutId);

      return NextResponse.json({
        license,
        readmeUrl,
        repositoryType: repoType,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
