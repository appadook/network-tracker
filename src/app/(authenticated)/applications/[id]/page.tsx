import ApplicationDetails from '../../../../components/applications/ApplicationDetails';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ApplicationDetails id={id} />;
}