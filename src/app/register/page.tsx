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
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Register</CardTitle>
          <CardDescription>
            Create an account to start predicting
          </CardDescription>
        </CardHeader>
        <form action={formAction} className="relative z-10">
          <CardContent className="space-y-5">
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground font-semibold">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required className="bg-background/50 shadow-inner border-border/50 focus-visible:ring-primary/50 h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground font-semibold">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 shadow-inner border-border/50 focus-visible:ring-primary/50 h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground font-semibold">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-background/50 shadow-inner border-border/50 focus-visible:ring-primary/50 h-12 text-lg" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 mt-2">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 h-12 text-lg font-medium transition-all active:scale-95" type="submit" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors">
                Log in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
