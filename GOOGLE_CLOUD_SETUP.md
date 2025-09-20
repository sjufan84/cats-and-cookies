# Google Cloud Storage Setup Guide

This guide will help you set up Google Cloud Storage for image uploads in your cookie business app.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Cloud project
3. Billing enabled on your project

## Step 1: Create a Google Cloud Storage Bucket

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **Cloud Storage** > **Buckets**
4. Click **Create Bucket**
5. Choose a unique bucket name (e.g., `sage-cookies-images`)
6. Select a location close to your users
7. Choose **Standard** storage class
8. Set access control to **Uniform** (this is required for our app)
9. Click **Create**

**Important**: Uniform bucket-level access is required for this application to work properly.

## Step 2: Create a Service Account

1. In the Google Cloud Console, go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Enter a name (e.g., `sage-cookies-storage`)
4. Add a description (e.g., `Service account for cookie business image uploads`)
5. Click **Create and Continue**
6. Grant the following roles:
   - **Storage Object Admin** (for uploading files)
   - **Storage Object Viewer** (for reading files)
7. Click **Continue** and then **Done**

## Step 3: Generate Service Account Key

1. Find your newly created service account in the list
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** > **Create New Key**
5. Choose **JSON** format
6. Click **Create**
7. The key file will be downloaded automatically

## Step 4: Configure Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Google Cloud Storage Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

### Example:
```env
GOOGLE_CLOUD_PROJECT_ID=sage-cookies-472620
GOOGLE_CLOUD_BUCKET_NAME=sage-cookies-images
GOOGLE_APPLICATION_CREDENTIALS=./sage-cookies-storage-key.json
```

### Important Notes:
- `GOOGLE_APPLICATION_CREDENTIALS` is the standard environment variable that Google Cloud libraries automatically use for authentication
- The project ID is optional in the Storage constructor - it will be read from the service account key file if not provided
- Make sure the service account key file is in your project directory and add it to `.gitignore` to keep it secure

## Step 5: Install Required Dependencies

The Google Cloud Storage client is already included in the project, but if you need to install it separately:

```bash
npm install @google-cloud/storage
```

## Step 6: Make Your Bucket Public (Optional)

If you want images to be publicly accessible:

1. Go to your bucket in the Google Cloud Console
2. Click on the **Permissions** tab
3. Click **Add Principal**
4. Add `allUsers` as the principal
5. Grant the **Storage Object Viewer** role
6. Click **Save**

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/admin/products/new`
3. Try uploading an image
4. Check your Google Cloud Storage bucket to see if the image was uploaded

## Security Best Practices

1. **Never commit your service account key to version control**
2. **Use environment variables for all sensitive configuration**
3. **Consider using Google Cloud Secret Manager for production**
4. **Set up proper IAM roles with minimal required permissions**
5. **Enable Cloud Audit Logs to monitor access**

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Check that your service account has the correct roles
   - Verify the `GOOGLE_APPLICATION_CREDENTIALS` path points to a valid JSON key file
   - Ensure the service account has **Storage Object Admin** and **Storage Object Viewer** roles

2. **"Bucket not found" errors**
   - Verify the `GOOGLE_CLOUD_BUCKET_NAME` environment variable is correct
   - Check that the bucket exists in the correct project
   - Ensure the service account has access to the bucket

3. **"Project not found" errors**
   - Verify your project ID is correct in `GOOGLE_CLOUD_PROJECT_ID`
   - Ensure billing is enabled on your project
   - Check that the service account belongs to the correct project

4. **"Google Cloud Storage not configured" errors**
   - Verify `GOOGLE_CLOUD_BUCKET_NAME` is set in your environment variables
   - Check that `GOOGLE_APPLICATION_CREDENTIALS` points to a valid file

### Debug Steps:

1. **Verify environment variables:**
   ```bash
   echo $GOOGLE_CLOUD_BUCKET_NAME
   echo $GOOGLE_APPLICATION_CREDENTIALS
   ```

2. **Test the service account key file:**
   ```bash
   cat $GOOGLE_APPLICATION_CREDENTIALS
   ```

3. **Check file permissions:**
   ```bash
   ls -la $GOOGLE_APPLICATION_CREDENTIALS
   ```

4. **Test bucket access in the Google Cloud Console**
5. **Check the application logs for detailed error messages**

## Production Considerations

1. **Use Google Cloud Secret Manager** instead of environment variables for the service account key
2. **Set up proper CORS policies** if needed for direct browser uploads
3. **Implement image optimization** and resizing
4. **Set up monitoring and alerting** for upload failures
5. **Consider using signed URLs** for more secure uploads

## Cost Optimization

1. **Use appropriate storage classes** (Standard for frequently accessed images)
2. **Set up lifecycle policies** to automatically delete old images
3. **Monitor your usage** through the Google Cloud Console
4. **Consider using Cloud CDN** for better performance and cost efficiency

## Support

If you encounter any issues:
1. Check the [Google Cloud Storage documentation](https://cloud.google.com/storage/docs)
2. Review the application logs
3. Test with a simple upload script to isolate the issue
