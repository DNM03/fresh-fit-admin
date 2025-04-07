import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Apple,
  Smartphone,
  Watch,
  Bluetooth,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

export function DeviceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>
            Manage devices that sync with your fitness account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Watch className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Fitness Watch Pro</p>
                  <p className="text-sm text-muted-foreground">
                    Last synced: Today, 9:41 AM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                >
                  Connected
                </Badge>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">iPhone 13 Pro</p>
                  <p className="text-sm text-muted-foreground">
                    Last synced: Yesterday, 7:30 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                >
                  Connected
                </Badge>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Apple className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Apple Health</p>
                  <p className="text-sm text-muted-foreground">
                    Last synced: 3 days ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                >
                  Connected
                </Badge>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Connect New Device
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Sync Settings</CardTitle>
          <CardDescription>
            Configure how your devices sync data with your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Sync Frequency</h4>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex-1">
                  Hourly
                </Button>
                <Button variant="default" className="flex-1">
                  Real-time
                </Button>
                <Button variant="outline" className="flex-1">
                  Manual
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Data Priority</h4>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex-1">
                  App
                </Button>
                <Button variant="default" className="flex-1">
                  Device
                </Button>
                <Button variant="outline" className="flex-1">
                  Merge
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Data Types to Sync</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="default" className="w-full">
                Steps
              </Button>
              <Button variant="default" className="w-full">
                Heart Rate
              </Button>
              <Button variant="default" className="w-full">
                Sleep
              </Button>
              <Button variant="default" className="w-full">
                Workouts
              </Button>
              <Button variant="outline" className="w-full">
                Calories
              </Button>
              <Button variant="outline" className="w-full">
                Weight
              </Button>
              <Button variant="outline" className="w-full">
                Blood Pressure
              </Button>
              <Button variant="outline" className="w-full">
                Oxygen
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bluetooth Devices</CardTitle>
          <CardDescription>
            Manage Bluetooth devices that connect directly to the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bluetooth className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Heart Rate Monitor</p>
                <p className="text-sm text-muted-foreground">Battery: 75%</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
          <Separator />
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Scan for Devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
