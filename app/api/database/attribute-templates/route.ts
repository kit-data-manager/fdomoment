import { NextRequest, NextResponse } from 'next/server';
import { getAttributeTemplatesByUserName, createAttributeTemplate, updateAttributeTemplate, deleteAttributeTemplate, getAttributeTemplateById } from '@/lib/database/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName');
    const templateId = searchParams.get('id');

    if (templateId) {
      const template = await getAttributeTemplateById(templateId);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    if (!userName) {
      return NextResponse.json({ error: 'userName parameter is required' }, { status: 400 });
    }

    const templates = await getAttributeTemplatesByUserName(userName);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to get attribute templates:', error);
    return NextResponse.json({ error: 'Failed to get attribute templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.userName || !body.name || !body.entries) {
      return NextResponse.json({ error: 'userName, name, and entries are required' }, { status: 400 });
    }

    const template = await createAttributeTemplate({
      userName: body.userName,
      name: body.name,
      entries: body.entries,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to create attribute template:', error);
    return NextResponse.json({ error: 'Failed to create attribute template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const template = await updateAttributeTemplate({
      id: body.id,
      name: body.name,
      entries: body.entries,
      userName: body.userName,
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update attribute template:', error);
    return NextResponse.json({ error: 'Failed to update attribute template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    await deleteAttributeTemplate(templateId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete attribute template:', error);
    return NextResponse.json({ error: 'Failed to delete attribute template' }, { status: 500 });
  }
}
