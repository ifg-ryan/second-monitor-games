// Old address for the username picker; it moved to /welcome.
import { redirect } from 'next/navigation';

export default function OnboardPage() {
  redirect('/welcome');
}
