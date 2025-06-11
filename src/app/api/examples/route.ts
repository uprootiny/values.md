import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const examplesDir = path.join(process.cwd(), 'examples');
    const files = await fs.readdir(examplesDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const examples = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(examplesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return { content };
      })
    );
    
    return NextResponse.json({ examples });
  } catch (error) {
    console.error('Error reading examples:', error);
    return NextResponse.json({ error: 'Failed to load examples' }, { status: 500 });
  }
}