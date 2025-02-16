import React from 'react'
import { uploadFile } from '@/lib/supabase'

type FileInfo = {
  fullPath: string;
  publicUrl: string | null;
  name: string;
  size: number;
  type: string;
}

interface ImageUploaderProps {
  children: React.ReactNode;
  bucketDirectory?: string;
  onFileUpload?: (fileInfo: FileInfo) => void;
  onError?: (error: any) => void;
  asPublic?: boolean;
}

const FileUploadWrapper: React.FC<ImageUploaderProps> = ({
  children,
  bucketDirectory = '',
  onFileUpload,
  onError,
  asPublic = false,
}) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target?.files?.[0]
      if (!file) return
      const fileInfo = await uploadFile(file, bucketDirectory, asPublic)
      const { publicUrl } = fileInfo
      publicUrl && onFileUpload && onFileUpload(fileInfo)
    } catch (error) {
      onError && onError(error)
    }
  }

  return (
    <>
      <input
        type="file"
        className="hidden"
        id="fileInput"
        onChange={handleFileChange}
      />
      <label htmlFor="fileInput">{children}</label>
    </>
  )
}

export default FileUploadWrapper
