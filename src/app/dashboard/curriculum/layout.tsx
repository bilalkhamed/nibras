import ProgramTabs from './components/program-tabs';

export default function CurriculumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProgramTabs />
      {children}
    </>
  );
}
