import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PLATFORM_ACTIVITIES } from '../../constants/superAdminData';

export function ActivityTimeline({ activities = PLATFORM_ACTIVITIES }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Recent Platform Activities
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit stream across billing, onboarding, and support
            </p>
          </div>
          <Link
            to="/super-admin/platform/audit-logs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
          >
            <span>Audit Logs</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <ol className="relative space-y-4 border-l border-slate-200 ml-2 pl-5">
          {activities.map((item) => (
            <li key={item.id} className="relative">
              <span
                className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-navy-800"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  {item.time}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                {item.detail}
              </p>
              <span className="mt-1 inline-block text-[11px] font-medium text-slate-400">
                {item.category}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ActivityTimeline;
