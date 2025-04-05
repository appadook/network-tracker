import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Network App</h1>
          <p className="text-stone-500">Track your professional connections and applications</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}