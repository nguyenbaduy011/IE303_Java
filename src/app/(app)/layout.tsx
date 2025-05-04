import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  image_url?: string | null;
  gender: "male" | "female";
  nationality: string;
  phone_number: string;
  hire_date: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

const mockUser: User = {
  id: "12345",
  first_name: "Joe",
  last_name: "Mama",
  email: "joemama@example.com",
  birth_date: "1975-4-30",
  image_url:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWii2rKTD3FgFmJVzm3Z3-QXdHOQhqm_7aWQZk_XoE4CfPByvrmH2cFshN4Trv5CPkxzs&usqp=CAU",
  gender: "male",
  nationality: "Vietnam",
  phone_number: "+1234567890",
  hire_date: "2022-01-01",
  address: "123 Main Street, Springfield, IL",
  createdAt: "",
  updatedAt: "",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header user={mockUser} />
      <main className="px-4 bg-slate-50">
        <div className="container mx-auto px-4 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
