'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/actions/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from 'next-auth';
import { toast } from 'sonner';

export default function ProfilePage({ user }: { user: User }) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  if (state?.success) {
    toast.success('Password changed successfully');
  } else if (state?.error) {
    toast.error(state.error);
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>View your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled value={user.email || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input disabled value={user.role || 'USER'} className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password securely.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input id="oldPassword" name="oldPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
