import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { lmsApi } from '../services/api'

export default function FileUpload({ onUploaded, accept = 'image/*,video/*,application/pdf', label = 'Upload media file' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const data = await lmsApi.uploadFile(file)
      onUploaded(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold shadow-sm">
        <UploadCloud size={16} />
        {uploading ? 'Uploading...' : label}
        <input type="file" accept={accept} className="hidden" onChange={handleFileSelect} />
      </label>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
