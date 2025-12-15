// app/dashboard/users/layout.tsx
export default function UsersRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-4">{children}</div>;
}
