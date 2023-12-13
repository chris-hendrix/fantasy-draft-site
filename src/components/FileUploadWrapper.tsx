import React from 'react'
import { uploadFile } from '@/lib/supabase'

interface ImageUploaderProps {
  children: React.ReactNode;
  bucketDirectory?: string;
  onFileUpload?: (fileUrl: string) => void;
  onError?: (error: any) => void;
}

const FileUploadWrapper: React.FC<ImageUploaderProps> = ({
  children,
  bucketDirectory = '',
  onFileUpload,
  onError,
}) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target?.files?.[0]
      if (!file) return
      const url = await uploadFile(file, bucketDirectory)
      url && onFileUpload && onFileUpload(url)
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
