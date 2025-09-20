import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage (only if environment variables are available)
let storage: Storage | null = null;
let bucketName: string | undefined = undefined;

if (process.env.GOOGLE_CLOUD_BUCKET_NAME) {
  // Use GOOGLE_APPLICATION_CREDENTIALS for authentication
  storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID, // Optional, will be read from credentials if not provided
  });
  bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
}

export async function POST(request: NextRequest) {
  try {
    if (!storage || !bucketName) {
      return NextResponse.json({ error: 'Google Cloud Storage not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const bucket = storage.bucket(bucketName);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `products/${timestamp}-${randomString}.${fileExtension}`;

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload to Google Cloud Storage
      const fileUpload = bucket.file(fileName);
      
      await fileUpload.save(buffer, {
        metadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      // Make the file publicly accessible
      await fileUpload.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} file(s) uploaded successfully` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

// Alternative method for direct file upload without form data
export async function PUT(request: NextRequest) {
  try {
    if (!storage || !bucketName) {
      return NextResponse.json({ error: 'Google Cloud Storage not configured' }, { status: 500 });
    }

    const { fileName, fileData, contentType } = await request.json();
    
    if (!fileName || !fileData) {
      return NextResponse.json({ error: 'fileName and fileData are required' }, { status: 400 });
    }

    const bucket = storage.bucket(bucketName);
    
    // Generate unique filename if not provided
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `products/${timestamp}-${randomString}.${fileExtension}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');

    // Upload to Google Cloud Storage
    const fileUpload = bucket.file(uniqueFileName);
    
    await fileUpload.save(buffer, {
      metadata: {
        contentType: contentType || 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make the file publicly accessible
    await fileUpload.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: uniqueFileName 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
