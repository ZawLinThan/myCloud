import AuthSubmitButton from './AuthSubmitButton';
import ErrorMessage from '../../../components/ErrorMessage';

type OTPFormProps = {
  backendErrorMsg: string;
  backendSuccessMsg: string;
  description: string;
  isResendingOtp: boolean;
  isVerifyingOtp: boolean;
  onResendOtp: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  otp: string;
  setOtp: (otp: string) => void;
  submitText: string;
  title: string;
};

const OTPForm = ({
  backendErrorMsg,
  backendSuccessMsg,
  description,
  isResendingOtp,
  isVerifyingOtp,
  onResendOtp,
  onSubmit,
  otp,
  setOtp,
  submitText,
  title,
}: OTPFormProps) => {
  return (
    <div className="w-full max-w-sm">
      <div>
        <p className="text-sm font-semibold text-accent">Verify email</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-app">
            Verification code
          </span>
          <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
            <input
              className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="123456"
              type="text"
              value={otp}
            />
          </span>
        </label>

        <AuthSubmitButton
          isLoading={isVerifyingOtp}
          loadingText="Verifying..."
          text={submitText}
        />
      </form>

      <div>
        <p className="mt-6 text-center text-sm text-muted">
          Did not get a code?
        </p>
        <button
          className="block w-full text-center font-semibold text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isResendingOtp}
          onClick={onResendOtp}
          type="button"
        >
          {isResendingOtp ? 'Sending...' : 'Click here to resend.'}
        </button>
      </div>

      {backendErrorMsg && <ErrorMessage message={backendErrorMsg} />}
      {backendSuccessMsg && (
        <p className="mt-4 text-sm text-emerald-600">{backendSuccessMsg}</p>
      )}
    </div>
  );
};

export default OTPForm;
