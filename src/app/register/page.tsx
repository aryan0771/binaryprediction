'use client';

import { useActionState, useEffect } from 'react';
import { registerAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      // Redirect to login after successful registration
      router.push('/login?registered=true');
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Register</CardTitle>
          <CardDescription>
            Create an account to start predicting
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary" type="submit" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                Log in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
