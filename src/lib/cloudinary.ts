import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function extractPublicId(cloudinaryUrl: string) {
  try {
    const url = new URL(cloudinaryUrl);
    const parts = url.pathname.split('/'); // breaks into [..., 'upload', 'v<version>', 'folder', 'filename.jpg']
    
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1 || parts.length <= uploadIndex + 2) {
      throw new Error('Invalid Cloudinary URL format');
    }

    // Extract parts after 'upload' and 'v<version>'
    const publicIdParts = parts.slice(uploadIndex + 2); // skip 'upload' and 'v<version>'
    const lastPart = publicIdParts.pop(); // Remove filename (e.g., 12345_avatar.jpg)

    // Remove extension from last part
    const fileNameWithoutExt = lastPart && lastPart.replace(/\.[^/.]+$/, '');
    publicIdParts.push(fileNameWithoutExt || '');

    return publicIdParts.join('/');
  } catch (err) {
    console.error('Failed to extract public ID:', (err as Error).message);
    return null;
  }
}

export const deleteFromCloudinary = async (cloudinaryURL: string, fileType: string) => {
    try {
        const publicId = extractPublicId(cloudinaryURL);
        if (!publicId) return null;
        // Delete file from cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: fileType || 'auto',
        });
        console.log(`Image deleted from cloudinary: ${response.result}`);
        return response;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return null;
    }
}

export default cloudinary