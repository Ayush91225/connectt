import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Support & Contact | Navchetna Technologies',
  description: 'Official support and contact desk for Connectt and Navchetna Technologies.'
};

export default function SupportPage() {
  redirect('https://www.navchetna.tech/contact');
}
