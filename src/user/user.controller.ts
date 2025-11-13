import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hash";
import { upload, deleteS3File } from "../utils/uploadService";
import prisma from "../prisma";

// username change
export const changeUsername = async (req: Request, res: Response) => {
  try {
    // get user id from middleware
    const userId = req.user;
    // get username from the request body
    const { newUsername } = req.body;

    // if the user id is missing, return error
    if (!userId) {
       return res.status(401).json({ error: "Unauthorized"})
    }

    // check if the new username is already in use
    const existing = await prisma.user.findUnique({
      where: { username: newUsername } 
    })
    // return error if so
    if (existing) {
      return res.status(409).json({ error: "Username already taken"});
    }

    // update username in the database
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername }
    })
    res.status(200).json({ username: updated.username});
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// password change
export const changePassword = async (req: Request, res: Response) => {
  try {
    // get user id from middleware
    const userId = req.user;
    // get old and new password
    const { oldPassword, newPassword } = req.body;
    // if new password is the same as the old one, return error
    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from old password"});
    }
    // check user id
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized"});
    }
    // find exact user
    const userRecord = await prisma.user.findUnique({
      where: { id: userId }
    });
    // if no user found, return error
        if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }
    // check if old password matches
    const valid = await comparePassword(oldPassword, userRecord!.passwordHash);
    // if not valid, return error
    if (!valid) {
      return res.status(401).json({ error: "Old password is incorrect"});
    }
    // hash new password
    const hashed = await hashPassword(newPassword);
    // update password in database
    await prisma.user.update({
      where: {id: userId },
      data: { passwordHash: hashed }
    });
    res.status(200).json({message: "Password changed successfully"});

  } catch (err) {
    res.status(500).json({ error: "Internal server error"});
  }
}

// upload profile picture
export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const file = req.file as Express.Multer.File & { location?: string } | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // multer-s3 provides 'location' (S3 URL), memory storage does not
    let imageUrl: string;
    
    if (file.location) {
      // S3 storage - use the S3 URL
      imageUrl = file.location;
    } else {
      // Memory storage fallback - file is in req.file.buffer
      // For production, you should either:
      // 1. Require S3 to be configured, OR
      // 2. Store the buffer somewhere (local disk, different cloud storage)
      // For now, we'll reject uploads without S3
      return res.status(503).json({ 
        error: "File upload service not configured. AWS S3 credentials required." 
      });
    }

    // Get user's current profile picture URL to delete old one
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    // Delete old profile picture from S3 if it exists
    if (currentUser?.profileImageUrl) {
      await deleteS3File(currentUser.profileImageUrl);
    }

    // Update database with new profile picture URL
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
      select: { id: true, profileImageUrl: true },
    });

    return res.status(200).json({ profileImageUrl: updated.profileImageUrl });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// get profile picture url
export const getProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    if (!user || !user.profileImageUrl) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    return res.status(200).json({ profileImageUrl: user.profileImageUrl });
  } catch (err) {
    console.error("Error fetching profile picture:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Get current profile picture URL before deleting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    // Delete file from S3 if it exists
    if (user?.profileImageUrl) {
      await deleteS3File(user.profileImageUrl);
    }

    // Update database to remove profile picture URL
    await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: null },
      select: { id: true },
    });

    return res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile picture:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}