import React, { useState, useEffect } from 'react';
import { Settings, Bell, Clock, MessageSquare, CreditCard, Calendar, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationPreferences {
  enable_in_app: boolean;
  quote_notifications: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  message_notifications: boolean;
  marketing_notifications: boolean;
  system_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_start_time: string;
  quiet_end_time: string;
}

export const NotificationPreferences: React.FC = () => {
  const { preferences, loadPreferences, updatePreferences } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPrefs) return;
    
    setSaving(true);
    const success = await updatePreferences(localPrefs);
    
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const updatePref = (key: keyof NotificationPreferences, value: boolean | string) => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      [key]: value
    });
  };

  if (!localPrefs) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <CardTitle className="text-2xl">Notification Preferences</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <Label className="text-base font-medium">Enable In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all in-app notifications
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.enable_in_app}
              onCheckedChange={(checked) => updatePref('enable_in_app', checked)}
            />
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Types</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <div>
                    <Label className="font-medium">Quote Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      New quotes, acceptances, and rejections
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localPrefs.quote_notifications}
                  onCheckedChange={(checked) => updatePref('quote_notifications', checked)}
                  disabled={!localPrefs.enable_in_app}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label className="font-medium">Booking Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Booking confirmations, cancellations, and updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localPrefs.booking_notifications}
                  onCheckedChange={(checked) => updatePref('booking_notifications', checked)}
                  disabled={!localPrefs.enable_in_app}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <div>
                    <Label className="font-medium">Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Payment due dates, receipts, and reminders
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localPrefs.payment_notifications}
                  onCheckedChange={(checked) => updatePref('payment_notifications', checked)}
                  disabled={!localPrefs.enable_in_app}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <Label className="font-medium">Message Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      New messages and chat updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localPrefs.message_notifications}
                  onCheckedChange={(checked) => updatePref('message_notifications', checked)}
                  disabled={!localPrefs.enable_in_app}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-pink-500" />
                  <div>
                    <Label className="font-medium">Marketing Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Promotions, tips, and platform updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localPrefs.marketing_notifications}
                  onCheckedChange={(checked) => updatePref('marketing_notifications', checked)}
                  disabled={!localPrefs.enable_in_app}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label className="font-medium">System Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Security alerts and system maintenance
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localPrefs.system_notifications}
                  onCheckedChange={(checked) => updatePref('system_notifications', checked)}
                  disabled={!localPrefs.enable_in_app}
                />
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quiet Hours</h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-indigo-500" />
                <div>
                  <Label className="font-medium">Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce notifications during specified hours
                  </p>
                </div>
              </div>
              <Switch
                checked={localPrefs.quiet_hours_enabled}
                onCheckedChange={(checked) => updatePref('quiet_hours_enabled', checked)}
                disabled={!localPrefs.enable_in_app}
              />
            </div>

            {localPrefs.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Start Time</Label>
                  <Select
                    value={localPrefs.quiet_start_time}
                    onValueChange={(value) => updatePref('quiet_start_time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">End Time</Label>
                  <Select
                    value={localPrefs.quiet_end_time}
                    onValueChange={(value) => updatePref('quiet_end_time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {saved && (
              <div className="text-green-600 text-sm flex items-center">
                ✓ Preferences saved successfully
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-24"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};