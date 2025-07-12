import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "shadow-lg",
            card: "bg-white rounded-lg p-8",
          }
        }}
        routing="path"
        path="/sign-up"
        redirectUrl="/"
      />
    </div>
  );
}