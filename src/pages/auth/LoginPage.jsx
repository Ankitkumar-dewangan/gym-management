import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ROLES, ROLE_HOME_ROUTES } from '../../constants/roles';
import { useAuth } from '../../contexts/AuthContext';

const STUDIO_IMAGE = '/src/assets/images/auth_gym_studio_1795081739515.jpg';

const ROLE_OPTIONS = [
  { value: ROLES.GYM_OWNER, label: 'Gym Owner' },
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
  { value: ROLES.MEMBER, label: 'Gym Member' },
];

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { signInWithPreviewRole } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: ROLES.GYM_OWNER,
    },
  });

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = signInWithPreviewRole(values.role, {
      email: values.email,
      name: values.email.split('@')[0].replace(/[._-]/g, ' '),
    });
    toast.success(`Signed in as ${user.name}`);
    navigate(ROLE_HOME_ROUTES[values.role] || '/gym/dashboard');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Left Form Panel */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between bg-white px-6 py-6 sm:px-10 lg:px-8 xl:px-12 border-r border-slate-200 h-full overflow-y-auto">
        <div className="shrink-0">
          <BrandLogo variant="dark" />
        </div>

        <div className="mx-auto w-full max-w-md my-auto py-4">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900">
            Sign in to GymPilot
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            Access your multi-branch gym operations, member portal, or platform console.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
            <Select
              label="Portal Role"
              options={ROLE_OPTIONS}
              {...register('role')}
            />

            <Input
              label="Email address"
              type="email"
              leftIcon={Mail}
              placeholder="you@gymclub.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              leftIcon={Lock}
              placeholder="Enter your password"
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              }
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-slate-300 text-navy-900 focus:ring-navy-700"
                />
                <span>Keep me signed in</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-navy-800 hover:text-navy-950 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-xs text-slate-500 shrink-0 pt-2">
          GymPilot Multi-Tenant Gym Platform ·{' '}
          <span className="font-medium text-slate-700">Powered by AGP Empire</span>
        </p>
      </div>

      {/* Right Architectural Showcase Panel */}
      <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative bg-navy-900 overflow-hidden h-full">
        {!imageError ? (
          <img
            src={STUDIO_IMAGE}
            alt="Modern strength training and athletic club interior"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-navy-900" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/35 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-8 xl:p-12 text-white max-w-2xl">
          <p className="text-sm font-medium text-emerald-300">
            Multi-Branch Club Infrastructure
          </p>
          <h2 className="mt-1.5 text-xl xl:text-2xl font-semibold leading-snug text-balance">
            Built for independent training clubs, multi-location studios, and member communities.
          </h2>
          <p className="mt-2 xl:mt-3 text-xs xl:text-sm text-slate-300 leading-relaxed">
            Unified memberships, branch attendance, recurring billing, and coaching programs in one structured workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
