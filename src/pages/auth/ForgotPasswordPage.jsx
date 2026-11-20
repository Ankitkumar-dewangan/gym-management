import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    setSubmittedEmail(values.email);
    toast.success('Reset instructions prepared');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8 sm:px-6">
      <div className="max-w-md w-full mx-auto pt-4">
        <Link to="/login" className="inline-block">
          <BrandLogo variant="dark" />
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        {submittedEmail ? (
          <div className="text-center py-2">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              If an account exists for{' '}
              <span className="font-medium text-slate-900">{submittedEmail}</span>,
              we have prepared password reset instructions.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setSubmittedEmail('')}
              >
                Try another email
              </Button>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter the email address associated with your gym or member account and we will send a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
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

              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Return to sign in
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        GymPilot Multi-Tenant Gym Platform ·{' '}
        <span className="font-medium text-slate-700">Powered by AGP Empire</span>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
