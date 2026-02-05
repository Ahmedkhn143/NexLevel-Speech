'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/shared';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsUpdating(true);
    try {
      await userApi.updateProfile({ name: name.trim() });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
      />

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Profile Information</h3>
            <p className="text-sm text-muted-foreground">Update your personal details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Email Address
            </label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={isUpdating || name === user?.name}
            icon={isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Security Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
          </div>
        </div>

        <Button 
          variant="secondary"
          onClick={() => toast.success('Password reset feature coming soon!')}
        >
          Change Password
        </Button>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Bell className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates about your generations</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-border bg-muted checked:bg-primary"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">News and product updates</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-border bg-muted checked:bg-primary"
            />
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-500/20">
        <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button
          variant="ghost"
          className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
          onClick={() => toast.error('Account deletion requires contacting support')}
        >
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
