import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you want to be notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="workout-reminders">Workout Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders about your scheduled workouts.
                  </p>
                </div>
                <Switch id="workout-reminders" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-updates">Goal Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about your progress towards fitness goals.
                  </p>
                </div>
                <Switch id="goal-updates" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="community-activity">Community Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about challenges, friends, and community events.
                  </p>
                </div>
                <Switch id="community-activity" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="product-updates">Product Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    News about app features and improvements.
                  </p>
                </div>
                <Switch id="product-updates" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Push Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-workout">Workout Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications for upcoming workouts.
                  </p>
                </div>
                <Switch id="push-workout" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-achievements">Achievements</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you earn badges or reach milestones.
                  </p>
                </div>
                <Switch id="push-achievements" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-messages">Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for new messages from trainers or friends.
                  </p>
                </div>
                <Switch id="push-messages" defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Frequency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-timing">Workout Reminder Timing</Label>
                <Select defaultValue="1hour">
                  <SelectTrigger id="reminder-timing">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30min">30 minutes before</SelectItem>
                    <SelectItem value="1hour">1 hour before</SelectItem>
                    <SelectItem value="3hours">3 hours before</SelectItem>
                    <SelectItem value="1day">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="digest-frequency">Weekly Digest</Label>
                <Select defaultValue="monday">
                  <SelectTrigger id="digest-frequency">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="none">Don't send</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
