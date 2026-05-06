import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spotydle mb-2">Crea tu cuenta</h1>
        <p className="text-gray-400">Únete a Spotydle y guarda tus estadísticas</p>
      </div>
      <RegisterForm />
    </div>
  );
}