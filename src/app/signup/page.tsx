import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Network App</h1>
          <p className="text-stone-500">Join to start tracking your professional journey</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}