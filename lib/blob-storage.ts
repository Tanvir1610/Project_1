import { put, del, list } from "@vercel/blob"

export class BlobStorageService {
  static async uploadFile(file: File, folder = "uploads"): Promise<string> {
    try {
      const filename = `${folder}/${Date.now()}-${file.name}`
      const blob = await put(filename, file, {
        access: "public",
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Failed to upload file")
    }
  }

  static async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
      const filename = `profiles/${userId}-${Date.now()}.${file.name.split(".").pop()}`
      const blob = await put(filename, file, {
        access: "public",
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading profile image:", error)
      throw new Error("Failed to upload profile image")
    }
  }

  static async uploadKYCDocument(file: File, userId: string, docType: string): Promise<string> {
    try {
      const filename = `kyc/${userId}/${docType}-${Date.now()}.${file.name.split(".").pop()}`
      const blob = await put(filename, file, {
        access: "public",
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading KYC document:", error)
      throw new Error("Failed to upload KYC document")
    }
  }

  static async uploadPaymentScreenshot(file: File, userId: string, transactionId: string): Promise<string> {
    try {
      const filename = `payments/${userId}/${transactionId}-${Date.now()}.${file.name.split(".").pop()}`
      const blob = await put(filename, file, {
        access: "public",
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading payment screenshot:", error)
      throw new Error("Failed to upload payment screenshot")
    }
  }

  static async deleteFile(url: string): Promise<void> {
    try {
      await del(url)
    } catch (error) {
      console.error("Error deleting file:", error)
      throw new Error("Failed to delete file")
    }
  }

  static async listFiles(folder = ""): Promise<string[]> {
    try {
      const { blobs } = await list({ prefix: folder })
      return blobs.map((blob) => blob.url)
    } catch (error) {
      console.error("Error listing files:", error)
      throw new Error("Failed to list files")
    }
  }
}
