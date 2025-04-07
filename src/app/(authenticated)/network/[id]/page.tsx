import ContactDetails from '../../../../components/network/ContactDetails';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ContactDetails id={id} />;
}