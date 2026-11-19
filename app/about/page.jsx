import { redirect } from 'next/navigation';

export const metadata = {
  title: 'About Connectt | Navchetna Technologies',
  description: 'Enterprise video communication and interactive collaboration platform by Navchetna Technologies.'
};

export default function AboutPage() {
  redirect('https://www.navchetna.tech/connectt');
}
