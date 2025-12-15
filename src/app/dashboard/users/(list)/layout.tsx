import { AddUserForm } from './add-user-form';

export default function UsersLayout({
  children,
  usersTable,
}: {
  children: React.ReactNode;
  usersTable: React.ReactNode;
}) {
  return (
    <div>
      <AddUserForm />
      {children}
      <div className="mt-4">{usersTable}</div>
    </div>
  );
}
