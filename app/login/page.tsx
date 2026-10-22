import { useInMemoryDb } from "@/lib/db/config";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const isInMemoryMode = useInMemoryDb();
  return <LoginForm isInMemoryMode={isInMemoryMode} />;
}
