import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Monitor } from "lucide-react";

export function AppearanceSettings() {
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Customize the appearance of the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Color Theme</Label>
            <RadioGroup
              defaultValue="system"
              className="grid grid-cols-3 gap-4"
            >
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem
                  value="light"
                  id="theme-light"
                  className="sr-only"
                />
                <Sun className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Light</span>
              </Label>
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem
                  value="dark"
                  id="theme-dark"
                  className="sr-only"
                />
                <Moon className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Dark</span>
              </Label>
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem
                  value="system"
                  id="theme-system"
                  className="sr-only"
                />
                <Monitor className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">System</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Accent Color</Label>
            <RadioGroup defaultValue="blue" className="grid grid-cols-6 gap-2">
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="blue"
                  id="color-blue"
                  className="sr-only"
                />
                <Label
                  htmlFor="color-blue"
                  className="h-8 w-8 cursor-pointer rounded-full bg-blue-500 ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&:has([data-state=checked])]:ring-2"
                />
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="green"
                  id="color-green"
                  className="sr-only"
                />
                <Label
                  htmlFor="color-green"
                  className="h-8 w-8 cursor-pointer rounded-full bg-green-500 ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&:has([data-state=checked])]:ring-2"
                />
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="purple"
                  id="color-purple"
                  className="sr-only"
                />
                <Label
                  htmlFor="color-purple"
                  className="h-8 w-8 cursor-pointer rounded-full bg-purple-500 ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&:has([data-state=checked])]:ring-2"
                />
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="orange"
                  id="color-orange"
                  className="sr-only"
                />
                <Label
                  htmlFor="color-orange"
                  className="h-8 w-8 cursor-pointer rounded-full bg-orange-500 ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&:has([data-state=checked])]:ring-2"
                />
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="pink"
                  id="color-pink"
                  className="sr-only"
                />
                <Label
                  htmlFor="color-pink"
                  className="h-8 w-8 cursor-pointer rounded-full bg-pink-500 ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&:has([data-state=checked])]:ring-2"
                />
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="red"
                  id="color-red"
                  className="sr-only"
                />
                <Label
                  htmlFor="color-red"
                  className="h-8 w-8 cursor-pointer rounded-full bg-red-500 ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&:has([data-state=checked])]:ring-2"
                />
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size">Font Size ({fontSize}px)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(16)}
              >
                Reset
              </Button>
            </div>
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
            />
            <div className="grid grid-cols-3 text-center text-xs text-muted-foreground">
              <div>Small</div>
              <div>Default</div>
              <div>Large</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
          <CardDescription>
            Customize how content is displayed in the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable animations throughout the app.
              </p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-view">Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Display more content with less spacing.
              </p>
            </div>
            <Switch id="compact-view" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for accessibility.
              </p>
            </div>
            <Switch id="reduced-motion" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="units">Measurement Units</Label>
            <Select defaultValue="metric">
              <SelectTrigger id="units">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lb, ft)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
