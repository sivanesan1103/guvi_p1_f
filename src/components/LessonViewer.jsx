import { resolveAssetUrl } from '../utils/assetUrl'

export default function LessonViewer({ lesson }) {
  if (!lesson) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6">Select a lesson to start learning.</div>
  }

  const contentUrl = lesson.contentUrl || lesson.videoUrl || lesson.pdfUrl || lesson.imageUrl
  const mediaUrl = contentUrl ? resolveAssetUrl(contentUrl) : ''

  if (!mediaUrl || !contentUrl) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold">{lesson.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
        <p className="mb-4 mt-1 text-sm text-slate-500">{lesson.type}</p>
        <p className="text-sm text-red-500">No content available for this lesson yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="text-xl font-bold">{lesson.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
      <p className="mb-4 mt-1 text-sm text-slate-500">{lesson.type}</p>

      {lesson.type === 'VIDEO' ? (
        <video controls className="h-[420px] w-full rounded-lg bg-black" src={mediaUrl} />
      ) : null}

      {lesson.type === 'PDF' ? (
        <iframe title={lesson.title} src={mediaUrl} className="h-[550px] w-full rounded-lg border border-slate-200" />
      ) : null}

      {lesson.type === 'IMAGE' ? (
        <img src={mediaUrl} alt={lesson.title} className="h-auto max-h-[550px] w-full rounded-lg border border-slate-200 object-contain" />
      ) : null}
    </div>
  )
}
