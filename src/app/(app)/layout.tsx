import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserType } from "@/types/types";

const mockUser: UserType = {
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
      <main >
        <div className="relative mx-auto  min-h-[calc(100vh-4rem)]">
          <SidebarNav user={mockUser} isAdmin={true} className="absolute z-50"/>

          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
