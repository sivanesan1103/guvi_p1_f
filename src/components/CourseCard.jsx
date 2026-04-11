import { Link } from 'react-router-dom'
import { resolveAssetUrl } from '../utils/assetUrl'

export default function CourseCard({
  course,
  action,
  actionLabel,
  actionDisabled = false,
  showDetails = true,
}) {
  const courseId = course.id ?? course.courseId
  const thumbnail = course.thumbnailUrl
    ? resolveAssetUrl(course.thumbnailUrl)
    : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={thumbnail}
        alt={course.title}
        className="h-44 w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900'
        }}
      />
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
        {course.instructorName ? (
          <p className="mt-1 text-sm font-medium text-slate-500">By {course.instructorName}</p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
      </div>
      <div className="flex gap-2 px-5 pb-5">
        {showDetails ? (
          <Link
            to={`/courses/${courseId}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Details
          </Link>
        ) : null}
        {action ? (
          <button
            onClick={() => action(course)}
            disabled={actionDisabled}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {actionLabel}
          </button>
        ) : actionLabel ? (
          <button
            disabled
            className="rounded-lg bg-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
