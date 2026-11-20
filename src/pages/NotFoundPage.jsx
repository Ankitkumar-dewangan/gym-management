import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import Button from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8 sm:px-6">
      <div className="max-w-lg w-full mx-auto">
        <Link to="/login" className="inline-block">
          <BrandLogo variant="dark" />
        </Link>
      </div>

      <div className="max-w-lg w-full mx-auto rounded-xl border border-slate-200 bg-white p-8 sm:p-10 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-navy-900">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-5 font-mono text-xs font-semibold text-emerald-700 tabular-nums">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          The page or workspace route you requested does not exist or has moved.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" leftIcon={ArrowLeft} fullWidth>
              Go to Sign In
            </Button>
          </Link>
          <Link to="/gym/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" fullWidth>
              Gym Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        GymPilot Multi-Tenant Gym Platform ·{' '}
        <span className="font-medium text-slate-700">Powered by AGP Empire</span>
      </p>
    </div>
  );
}

export default NotFoundPage;
